import { v4 as uuidv4 } from 'uuid';

import { TrackerTypeEnum } from '../../models/trackerType';

import type { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkInsert('tracker_type', [
    {
      uuid: uuidv4(),
      type: TrackerTypeEnum.TELTONIKA,
      protocol: 'Codec 8 Extended',
      data_format: JSON.stringify({
        speed: '0',
        height: '0',
        latitude: 0,
        longitude: 0,
        mobile_carrier: '0',
        mobile_network: '0',
        mobile_signal: '0',
        battery: '0',
      }),
      label: 'tracker.teltonika',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: uuidv4(),
      type: TrackerTypeEnum.SPOTPILOT,
      protocol: 'spotpilot',
      data_format: JSON.stringify({
        speed: '0',
        height: '0',
        latitude: 0,
        longitude: 0,
        mobile_carrier: '0',
        mobile_network: '0',
        mobile_signal: '0',
        battery: '0',
      }),
      label: 'tracker.spotpilot',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: uuidv4(),
      type: TrackerTypeEnum.MOBILE,
      protocol: 'socket',
      data_format: JSON.stringify({
        speed: '0',
        height: '0',
        latitude: 0,
        longitude: 0,
        mobile_carrier: '0',
        mobile_network: '0',
        mobile_signal: '0',
        battery: '0',
      }),
      label: 'tracker.mobile',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      uuid: uuidv4(),
      type: TrackerTypeEnum.QUECLINK,
      protocol: 'queclink',
      data_format: JSON.stringify({
        speed: '0',
        height: '0',
        latitude: 0,
        longitude: 0,
        mobile_carrier: '0',
        mobile_network: '0',
        mobile_signal: '0',
        battery: '0',
      }),
      label: 'tracker.queclink',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete('tracker_type', {}, {});
};
