import Constants from 'expo-constants';
const ENV = {
    dev: {
      apiUrl: "https://d3-team-project-31-appetite.herokuapp.com/",
    },
    prod: {
      apiUrl: "https://d3-team-project-31-appetite.herokuapp.com/",
    }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  if (env === null || env === undefined || env === "" || env.indexOf("dev") !== -1) return ENV.dev;
  if (env.indexOf("prod") !== -1) return ENV.prod;
}

const selectedENV = getEnvVars();

export default selectedENV;