import { TrackerTypeEnum } from '../../models/trackerType';

import type { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const teltonikaType = await queryInterface.rawSelect('tracker_type', { where: { type: TrackerTypeEnum.TELTONIKA } }, [
    'uuid',
  ]);
  const spotpilotType = await queryInterface.rawSelect('tracker_type', { where: { type: TrackerTypeEnum.SPOTPILOT } }, [
    'uuid',
  ]);
  await queryInterface.bulkInsert('tracker', [
    {
      uuid: '0548fd93-5c27-4e39-8019-b551809b45ae',
      imei: '866344057342581',
      model_name: 'fmc920',
      type_uuid: teltonikaType,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: 'c5cb96d7-0dbc-45fe-8f33-fe9922ae92c7',
      imei: '123456789012301',
      model_name: 'fmc650',
      type_uuid: teltonikaType,

      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: '10ca11ea-70a6-4d9c-9899-aa13c547cf75',
      imei: '123456789012302',
      model_name: 'fmc650',
      type_uuid: teltonikaType,

      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: '3b0aef3f-f04e-4e23-9550-4202b15bed58',
      imei: '123456789012303',
      model_name: 'fmc650',
      type_uuid: teltonikaType,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: 'd1c9e5b8-9f0a-4c3e-8b2e-7a1f2c3d4e5f',
      imei: 'C2718D29-EE87-4C28-AABB-39047EC52D4D',
      model_name: 'spotpilot',
      type_uuid: spotpilotType,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkInsert('tracker', []);
};
