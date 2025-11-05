import { UserRepository } from "@/app/modules/user/user.repository";
import { ProfileRepository } from "@/app/modules/profile/profile.repository";
import { ConnectionRepository } from "@/app/modules/connection/connection.repository";
import type { AuthPayload } from "@/app/modules/auth/auth.dto";
import { In, Not } from "typeorm";
import { UserAnswerRepository } from "./userAnswer.repository";
import { DailyBatchRepository } from "./dailyBatch.repository";
import type { Profile } from "../profile/profile.entity";
import type { UserAnswer } from "./userAnswer.entity";
import { QuestionType } from "../question/question.entity";

// --- Configuration for our algorithm ---
const DAILY_BATCH_SIZE = 10;
const WEIGHT_INTERESTS = 0.4;
const WEIGHT_QUESTIONS = 0.6;

interface CompatibilityScore {
  profileId: string;
  score: number;
}

export class MatchingService {
  private userRepo = UserRepository;
  private profileRepo = ProfileRepository;
  private connRepo = ConnectionRepository;
  private answerRepo = UserAnswerRepository;
  private batchRepo = DailyBatchRepository; // <-- 2. Use new repo

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
      return this.profileRepo.find({
        where: { id: In(existingBatch.matched_profile_ids) },
      });
    }

    // --- 4. SLOW PATH: No valid batch. Generate a new one. ---
    console.log(
      `[MatchingService] No valid batch. Generating new one for ${userId}`,
    );
    const newBatchProfiles = await this._generateAndSaveNewBatch(auth);
    return newBatchProfiles;
  }

  /**
   * Runs the expensive scoring algorithm and saves the result.
   */
  private async _generateAndSaveNewBatch(
    auth: AuthPayload,
  ): Promise<Profile[]> {
    const { userId, profileId } = auth;

    // 1. Get current user's data
    const myProfile = await this.profileRepo.findOneBy({ id: profileId });
    if (!myProfile) {
      throw new Error("Your profile could not be found.");
    }
    const myAnswers = await this.answerRepo.findAllByUserId(userId);
    const myInterests = myProfile.interests || [];

    // 2. Get the "Pool" of all potential matches
    const pool = await this._getMatchingPool(userId);
    if (pool.length === 0) {
      return []; // No one to match with
    }

    // 3. Score every profile in the pool
    const scoredProfiles: CompatibilityScore[] = [];
    for (const profile of pool) {
      const theirAnswers = await this.answerRepo.findAllByUserId(
        profile.user_id,
      );
      const theirInterests = profile.interests || [];

      const score = this._calculateCompatibilityScore(
        myAnswers,
        theirAnswers,
        myInterests,
        theirInterests,
      );

      scoredProfiles.push({ profileId: profile.id, score });
    }

    // 4. Sort by score and take the top batch
    const topScoredProfiles = scoredProfiles
      .sort((a, b) => b.score - a.score)
      .slice(0, DAILY_BATCH_SIZE);

    const finalProfileIds = topScoredProfiles.map((p) => p.profileId);
    if (finalProfileIds.length === 0) {
      return []; // No matches found
    }

    // 5. Save the new batch to our table
    await this.batchRepo.save(
      this.batchRepo.create({
        user_id: userId,
        matched_profile_ids: finalProfileIds,
      }),
    );

    // 6. Return the full profile objects for the new batch
    return this.profileRepo.find({
      where: { id: In(finalProfileIds) },
    });
  }

  // --- PRIVATE ALGORITHM HELPERS ---
  // (These are unchanged from my previous generation)

  private async _getMatchingPool(userId: string): Promise<Profile[]> {
    const connections = await this.connRepo.find({
      where: [{ user_a_id: userId }, { user_b_id: userId }],
    });

    const excludedUserIds = new Set<string>();
    excludedUserIds.add(userId);
    connections.forEach((conn) => {
      excludedUserIds.add(conn.user_a_id);
      excludedUserIds.add(conn.user_b_id);
    });

    return this.profileRepo.find({
      where: {
        user_id: Not(In(Array.from(excludedUserIds))),
      },
    });
  }

  private _calculateCompatibilityScore(
    myAnswers: UserAnswer[],
    theirAnswers: UserAnswer[],
    myInterests: string[],
    theirInterests: string[],
  ): number {
    const interestScore = this._calculateInterestScore(
      myInterests,
      theirInterests,
    );
    const questionScore = this._calculateQuestionScore(myAnswers, theirAnswers);
    return interestScore * WEIGHT_INTERESTS + questionScore * WEIGHT_QUESTIONS;
  }

  private _calculateInterestScore(
    myInterests: string[],
    theirInterests: string[],
  ): number {
    const setA = new Set(myInterests);
    const setB = new Set(theirInterests);
    if (setA.size === 0 && setB.size === 0) return 0.5;
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  private _calculateQuestionScore(
    myAnswers: UserAnswer[],
    theirAnswers: UserAnswer[],
  ): number {
    const myAnswerMap = new Map(myAnswers.map((a) => [a.question_id, a]));
    const theirAnswerMap = new Map(theirAnswers.map((a) => [a.question_id, a]));

    let totalScore = 0;
    let sharedQuestions = 0;

    for (const [questionId, myAnswer] of myAnswerMap) {
      const theirAnswer = theirAnswerMap.get(questionId);

      if (theirAnswer && myAnswer.question) {
        sharedQuestions++;
        const question = myAnswer.question;

        if (question.type === QuestionType.SCALE_1_5) {
          const dist = Math.abs(
            Number(myAnswer.answer_value) - Number(theirAnswer.answer_value),
          );
          totalScore += 1.0 - dist / 4.0; // Max distance is 4 (5-1)
        } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
          totalScore +=
            myAnswer.answer_value === theirAnswer.answer_value ? 1.0 : 0.0;
        }
      }
    }
    if (sharedQuestions === 0) return 0.3; // Neutral score
    return totalScore / sharedQuestions;
  }
}
