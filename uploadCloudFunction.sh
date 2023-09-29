set -x 
echo ${installPath}
echo ${projectPath}
echo ${envId}

${installPath} cloud functions deploy --e ${envId} --n quickstartFunctions --r --project ${projectPath}