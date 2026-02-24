import { Op } from 'sequelize';

import { questionConfig } from '@/app/config/question.config';
import Database from '@/app/core/database/database';

import DailyBatchRepository from './dailyBatch.repository';
import UserAnswerRepository from './userAnswer.repository';

import type Connection from '@/app/core/database/entities/connection.entity';
import type Profile from '@/app/core/database/entities/profile.entity';
import type UserAnswer from '@/app/core/database/entities/userAnswer.entity';
import type { AuthPayload, PassPayload, MatchPayload } from '@/app/features/auth/auth.dto';
import type { Transaction } from 'sequelize';

// --- Configuration for our algorithm ---
const DAILY_BATCH_SIZE = 10;
const WEIGHT_INTERESTS = 0.4;
const WEIGHT_QUESTIONS = 0.6;

interface CompatibilityScore {
  profileId: string;
  score: number;
}

export default class MatchingService {
  private answerRepo = new UserAnswerRepository();

  private batchRepo = new DailyBatchRepository();

  private models = Database.getInstance().models;

  private sequelize = Database.getInstance().sequelize;

  /**
   * The main public method.
   * Fetches the user's valid batch from the cache (daily_batch table).
   * If no valid batch exists, it generates, saves, and returns a new one.
   */
  public async getDailyBatch(auth: AuthPayload): Promise<Profile[]> {
    const { userId } = auth;

    // --- 3. FAST PATH: Check for an existing, valid batch ---
    const existingBatch = await this.batchRepo.findValidBatchByUserId(userId);

    if (existingBatch) {
      console.log(`[MatchingService] Found valid batch for user ${userId}`);
      // Batch found. Fetch the profiles for the IDs.
      return this.models.Profile.findAll({
        where: { id: { [Op.in]: existingBatch.matched_profile_ids } },
      });
    }

    // --- 4. SLOW PATH: No valid batch. Generate a new one. ---
    console.log(`[MatchingService] No valid batch. Generating new one for ${userId}`);
    const newBatchProfiles = await this.generateAndSaveNewBatch(auth);
    return newBatchProfiles;
  }

  async passProfile(req: PassPayload): Promise<{ status: string; code: number }> {
    const { userId, passedProfileId } = req;

    const batch = await this.batchRepo.findValidBatchByUserId(userId);

    if (!batch) throw new Error('No active daily batch found');

    const matchedIds = (batch.matched_profile_ids || []).filter((e: string) => e !== passedProfileId);

    const passedIds = [...batch.passed_profile_ids];
    if (!passedIds.includes(passedProfileId)) {
      passedIds.push(passedProfileId);
    }

    await this.batchRepo.update(batch.id, {
      matched_profile_ids: matchedIds,
      passed_profile_ids: passedIds,
    });

    return { status: 'success', code: 200 };
  }

  async matchProfile(req: MatchPayload): Promise<{ status: string; code: number }> {
    const { userId, matchedProfileId } = req;

    return this.sequelize.transaction(async (t: Transaction) => {
      const user = await this.models.User.findByPk(userId, { transaction: t });

      const batch = await this.models.DailyBatch.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        transaction: t,
      });

      const likedUser = await this.models.Profile.findOne({
        where: { id: matchedProfileId },
        include: [{ association: 'user' }],
        transaction: t,
      });

      if (!user) throw new Error('User not found');
      if (!likedUser?.user) throw new Error('Matched profile user not found');
      if (!batch) throw new Error('No active daily batch found');

      const matchedIds = batch.matched_profile_ids.filter((e: string) => e !== matchedProfileId);

      const connectedIds = [...batch.connected_profile_ids];
      if (!connectedIds.includes(matchedProfileId)) {
        connectedIds.push(matchedProfileId);
      }

      await batch.update(
        {
          matched_profile_ids: matchedIds,
          connected_profile_ids: connectedIds,
        },
        { transaction: t },
      );

      const connection = await this.models.Connection.create(
        {
          user_a_id: userId,
          user_b_id: likedUser.user.id,
          status: 'PENDING',
        },
        { transaction: t },
      );

      await this.models.Room.create(
        {
          connection_id: connection.id,
        },
        { transaction: t },
      );

      return { status: 'success', code: 200 };
    });
  }

  async revertAllPasses(req: PassPayload): Promise<{ status: string; code: number }> {
    const { userId } = req;

    const batch = await this.batchRepo.findValidBatchByUserId(userId);

    if (!batch) throw new Error('No active daily batch found');

    const matchedIds = [...batch.matched_profile_ids, ...batch.passed_profile_ids];

    await this.batchRepo.update(batch.id, {
      matched_profile_ids: matchedIds,
      passed_profile_ids: [],
    });

    return { status: 'success', code: 200 };
  }

  /**
   * Runs the expensive scoring algorithm and saves the result.
   */
  private async generateAndSaveNewBatch(auth: AuthPayload): Promise<Profile[]> {
    const { userId, profileId } = auth;

    // 1. Get current user's data
    const myProfile = await this.models.Profile.findByPk(profileId);
    if (!myProfile) {
      throw new Error('Your profile could not be found.');
    }
    const myAnswers = await this.answerRepo.findAllByUserId(userId);

    const myInterests = myProfile.interests ?? [];

    // 2. Get the "Pool" of all potential matches
    const pool = await this.getMatchingPool(userId);
    if (pool.length === 0) {
      return []; // No one to match with
    }

    // 3. Score every profile in the pool
    const scoredProfiles: CompatibilityScore[] = [];
    for (const profile of pool) {
      const theirAnswers = await this.answerRepo.findAllByUserId(profile.user_id);
      const theirInterests = profile.interests ?? [];

      const score = this.calculateCompatibilityScore(myAnswers, theirAnswers, myInterests, theirInterests);

      scoredProfiles.push({ profileId: profile.id, score });
    }

    // 4. Sort by score and take the top batch
    const topScoredProfiles = scoredProfiles.sort((a, b) => b.score - a.score).slice(0, DAILY_BATCH_SIZE);

    const finalProfileIds = topScoredProfiles.map((p) => p.profileId);
    if (finalProfileIds.length === 0) {
      return []; // No matches found
    }

    // 5. Save the new batch to our table
    await this.batchRepo.save({
      user_id: userId,
      matched_profile_ids: finalProfileIds,
      passed_profile_ids: [],
      connected_profile_ids: [],
    });

    // 6. Return the full profile objects for the new batch
    return this.models.Profile.findAll({
      where: { id: { [Op.in]: finalProfileIds } },
    });
  }

  // --- PRIVATE ALGORITHM HELPERS ---

  private async getMatchingPool(userId: string): Promise<Profile[]> {
    const connections = await this.models.Connection.findAll({
      where: {
        [Op.or]: [{ user_a_id: userId }, { user_b_id: userId }],
      },
    });

    const excludedUserIds = new Set<string>();
    excludedUserIds.add(userId);
    connections.forEach((conn: Connection) => {
      excludedUserIds.add(conn.user_a_id);
      excludedUserIds.add(conn.user_b_id);
    });

    return this.models.Profile.findAll({
      where: {
        user_id: {
          [Op.notIn]: Array.from(excludedUserIds),
        },
      },
    });
  }

  private calculateCompatibilityScore(
    myAnswers: UserAnswer[],
    theirAnswers: UserAnswer[],
    myInterests: string[],
    theirInterests: string[],
  ): number {
    const interestScore = this.calculateInterestScore(myInterests, theirInterests);
    const questionScore = this.calculateQuestionScore(myAnswers, theirAnswers);
    return interestScore * WEIGHT_INTERESTS + questionScore * WEIGHT_QUESTIONS;
  }

  private calculateInterestScore(myInterests: string[], theirInterests: string[]): number {
    const setA = new Set(myInterests);
    const setB = new Set(theirInterests);
    if (setA.size === 0 && setB.size === 0) return 0.5;
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  private calculateQuestionScore(myAnswers: UserAnswer[], theirAnswers: UserAnswer[]): number {
    const myAnswerMap = new Map(myAnswers.map((a) => [a.question_id, a]));
    const theirAnswerMap = new Map(theirAnswers.map((a) => [a.question_id, a]));

    let totalScore = 0;
    let sharedQuestions = 0;

    for (const [questionId, myAnswer] of myAnswerMap) {
      const theirAnswer = theirAnswerMap.get(questionId);

      if (theirAnswer && myAnswer.question) {
        sharedQuestions++;
        const { question } = myAnswer;

        if (question.type === questionConfig.QUESTION_TYPES.SCALE) {
          const dist = Math.abs(Number(myAnswer.answer_value) - Number(theirAnswer.answer_value));
          totalScore += 1.0 - dist / 4.0; // Max distance is 4 (5-1)
        } else if (question.type === questionConfig.QUESTION_TYPES.MULTIPLE_CHOICE) {
          totalScore += myAnswer.answer_value === theirAnswer.answer_value ? 1.0 : 0.0;
        }
      }
    }
    if (sharedQuestions === 0) return 0.3; // Neutral score
    return totalScore / sharedQuestions;
  }
}
