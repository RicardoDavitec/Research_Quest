import 'dotenv/config';

export default {
  migrate: {
    datasourceUrl: process.env.DATABASE_URL,
  },
};
