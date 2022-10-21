#!/usr/bin/env bash

#
# Copyright (C) 2010-2022 Talend Inc. - www.talend.com
#
# This source code is available under agreement available at
# https://www.talend.com/legal-terms/us-eula
#
# You should have received a copy of the agreement
# along with this program; if not, write to Talend SA
# 5 rue Salomon de Rothschild - 92150 Suresnes
#

set -xe

main() {

    local version="${1?Missing version}"
    local NEXUS_USERNAME="${2?Missing nexus username}"
    local NEXUS_PASSWORD="${3?Missing nexus password}" 
    local mavenSettingsPath="${4?Missing maven settings}"
    local sshKeyFile="${5?Missing private SSH key file}"
    local nexusRepositoryBaseUrl="${6?Missing nexus url}"
    local nexusRepositoryId="${7?Missing nexus repository id}"
    local nexusGroupBaseUrl="${8?Missing nexus Group Base Url}"
    local groupId="${9?Missing group id}"
    local starterKitArtifactId="${10?Missing starter kit artifact id}"
    local themeArtifactId="${11?Missing starter kit artifact id}"
    
    local tag="v${version}"
    local branch="main"

    #PREREQUISITES

    #checking that the version has not already been published
    starterKitVersionExist="$(curl -I -s -u ${NEXUS_USERNAME}:${NEXUS_PASSWORD} ${nexusGroupBaseUrl}/${starterKitArtifactId}/$version | grep HTTP)"
    themeVersionExist="$(curl -I -s -u ${NEXUS_USERNAME}:${NEXUS_PASSWORD} ${nexusGroupBaseUrl}/${themeArtifactId}/$version | grep HTTP)" 
    if [[ ${starterKitVersionExist} != *'404 Not Found'* || ${themeVersionExist} != *'404 Not Found'* ]]; then
      printf 'The provided version %s has already been published \n' "$version"
      return 1
    else
      printf 'The provided version %s is valid \n' "$version"
    fi

    # initialize git
    initializeWorkFolder "apimgmt-api-portal"
    initializeSsh "$sshKeyFile"
    checkTagDoesNotExist "$tag"
    fetchBranch "$branch"
    git checkout "$branch"
    
    # check that the version in question has been documented in CHANGELOG.md
    checkChangelogIsUpToDate "$version"

    # create version txt files
    echo "$version" > VERSION_RELEASE
    echo "$version" > themes/talend/VERSION_RELEASE
    git  add . 
    git commit -m "new file VERSION_RELEASE $version"

    # create a zip of entiere repo 
    local starterKitFile="${starterKitArtifactId}-${version}.zip"
    zip --recurse-paths ${starterKitFile} . --exclude 'Jenkinsfile' '*.sh' '.git/*' '.DS_Store'

    # create a zip of the folder containing the theme
    local themeFile="${themeArtifactId}-${version}.zip"
    (
      cd themes
      zip --recurse-paths ../${themeFile} . --exclude '.DS_Store'
    )
    
    
    #push zip starter-kit on nexus
    mvn deploy:deploy-file \
        --batch-mode \
        -DgroupId="$groupId" \
        -DartifactId="${starterKitArtifactId}" \
        -DrepositoryId="${nexusRepositoryId}" \
        -Durl="${nexusRepositoryBaseUrl}/${nexusRepositoryId}" \
        -Dversion="${version}" \
        -DgeneratePom=false \
        -Dfile="${starterKitFile}" \
        -Dpackaging=zip \
        --settings "$mavenSettingsPath"

    #push zip theme on nexus
    mvn deploy:deploy-file \
        --batch-mode \
        -DgroupId="$groupId" \
        -DartifactId="${themeArtifactId}" \
        -DrepositoryId="${nexusRepositoryId}" \
        -Durl="${nexusRepositoryBaseUrl}/${nexusRepositoryId}" \
        -Dversion="${version}" \
        -DgeneratePom=false \
        -Dfile="${themeFile}" \
        -Dpackaging=zip \
        --settings "$mavenSettingsPath"
    
    rm "${themeFile}"
    rm "${starterKitFile}"

    #tag repo with version
    git tag "$tag"
    git push origin "$tag"

}

checkTagDoesNotExist() {
  local tag="$1"

  if git ls-remote --exit-code origin "refs/tags/$tag"; then
    printf 'The tag %s already exists, aborting...\n' "$tag"
    return 1
  fi
}

# Creates an empty repository next to apimgmt-misc and initializes an empty git repository
initializeWorkFolder() {
  local repositoryName="${1?Missing repository name}"
  local currentRepoTopLevel
  currentRepoTopLevel="$(git rev-parse --show-toplevel)"

  cd "$currentRepoTopLevel"
  cd ..
  mkdir -p "$repositoryName"
  cd "$repositoryName"
  git init
  git remote add origin "git@github.com:Talend/${repositoryName}.git" &> /dev/null
}

# Prepares SSH communication to GitHub
initializeSsh() {
  local sshKeyFile="${1?Missing ssh key file}"
  mkdir -p ~/.ssh
  {
    printf 'Host *\n'
    printf ' StrictHostKeyChecking no\n'
  } > ~/.ssh/config
  eval "$(ssh-agent)"
  ssh-add "${sshKeyFile}"
  ssh-add -l
}

# Fetches a branch from the given repository.
fetchBranch() {
  local branchName="$1"

  git fetch origin \
    --no-tags \
    --depth 1 \
    "+refs/heads/${branchName}:refs/remotes/origin/${branchName}"
}

checkChangelogIsUpToDate() {
  local version="$1"

  changelogContent="$(grep "$version" CHANGELOG.md)"
    if [[ $changelogContent == "" ]]; then
      printf 'The version %s is not documented in the changelog, aborting ...\n' "$version"
      return 1
    fi
}

main "$@"
