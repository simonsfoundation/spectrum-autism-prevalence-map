exitrc=0

if [[ "${BranchName}" == 'main' ]]; then
  echo "Merging main into develop"
  git config --global user.email "cloud-admins@simonsfoundation.org"
  git config --global user.name "AWS-CodePipeline"
  git checkout main
  git branch --set-upstream-to=origin/main main
  git pull
  git checkout develop
  git branch --set-upstream-to=origin/develop develop
  git pull
  git merge main -m "Merge branch 'main' into branch 'develop'"
  exitrc="${?}"
  git push
else
  echo "Not merging main into develop"
fi
exit "${exitrc}"
