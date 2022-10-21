#!/usr/bin/groovy
 /*
 * Copyright (C) 2010-2020 Talend Inc. - www.talend.com
 *
 * This source code is available under agreement available at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * You should have received a copy of the agreement
 * along with this program; if not, write to Talend SA
 * 9 rue Pages 92150 Suresnes, France
 */

  String groupId = "org.talend.apimgmt.designer"
  String groupIdPath = groupId.replaceAll('\\.', '/')
  String nexusRepositoryBaseUrl = "https://artifacts-zl.talend.com/nexus/content/repositories"
  String nexusRepositoryId = "releases"
  String nexusGroupBaseUrl = "${nexusRepositoryBaseUrl}/${nexusRepositoryId}/${groupIdPath}"
  String slackChannel = "apiteam-portal-notif"
  String starterKitArtifactId = "api-portal-starter-kit"
  String themeArtifactId = "api-portal-talend-theme"

  /**
  * Pod configuration
  */
  def podLabel = "${}-${UUID.randomUUID().toString()}".take(53)
  String podConfiguration = """
  apiVersion: v1
  kind: Pod
  spec:
    imagePullSecrets:
      - talend-registry
    containers:
      - name: node
        image: ${env.DOCKER_REGISTRY_HOST}${env.TSBI_IMAGE_PATH}/node10-builder:${env.TSBI_BUILD_VERSION}
        command:
          - cat
        tty: true    
        volumeMounts:
          - name: efs-jenkins-apiteam-m2
            mountPath: "/root/.m2"
          - name: efs-jenkins-apiteam-npm
            mountPath: "/root/.npm/_cacache"

    volumes:  
      - name: efs-jenkins-apiteam-m2
        persistentVolumeClaim:
          claimName: efs-jenkins-apiteam-m2
      - name: efs-jenkins-apiteam-npm
        persistentVolumeClaim:
          claimName: efs-jenkins-apiteam-npm
  """

  /**
  * Credentials
  */
  def nexusCredentials = usernamePassword(
    credentialsId: 'nexus-artifact-zl-credentials',
    passwordVariable: 'NEXUS_PASSWORD',
    usernameVariable: 'NEXUS_USERNAME')
  def mavenSettings = configFile(
    fileId: 'maven-settings-nexus-zl',
    variable: 'MAVEN_SETTINGS')
  def sshCredentials = sshUserPrivateKey(credentialsId: "github-ssh-build-talend-tadt", keyFileVariable: 'SSH_KEY_FILE')

 pipeline {
   agent {
     kubernetes {
       label podLabel
       yaml podConfiguration
     }
   }

   parameters {
     string(
       name: 'VERSION',
       description: 'version number to deliver')
     booleanParam(
       name: 'SLACK_NOTIF',
       description: 'Set to true if you want to send a slack notification',
       defaultValue: 'false')
   }

   stages {
     stage('script') {
       steps {
        container('node'){
         script {
            withCredentials([nexusCredentials]) {
              withCredentials([sshCredentials]) {
                configFileProvider([configFile(fileId: 'maven-settings-nexus-zl', variable: 'MAVEN_SETTINGS')]) {
                    sh """
                      bash script.sh \
                        "${params.VERSION}" \
                        "${NEXUS_USERNAME}" \
                        "${NEXUS_PASSWORD}" \
                        "${MAVEN_SETTINGS}" \
                        "${SSH_KEY_FILE}" \
                        "${nexusRepositoryBaseUrl}" \
                        "${nexusRepositoryId}" \
                        "${nexusGroupBaseUrl}" \
                        "${groupId}" \
                        "${starterKitArtifactId}" \
                        "${themeArtifactId}"
                    """
                }
              }
            }
         }
        }
       }
     }
   }

   post {
      success {
        script {
          pathToStarterKitZip = "${nexusGroupBaseUrl}/${starterKitArtifactId}/${params.VERSION}/${starterKitArtifactId}-${params.VERSION}.zip"
          pathToThemeZip = "${nexusGroupBaseUrl}/${themeArtifactId}/${params.VERSION}/${themeArtifactId}-${params.VERSION}.zip"
          if (params.SLACK_NOTIF) {
            slackSend(
              color: '#00AA00',
              channel: slackChannel,
              message: "SUCCESSFUL: Release *${starterKitArtifactId}* & *${themeArtifactId}* `version ${params.VERSION}`, :link: links ${pathToStarterKitZip} & ${pathToThemeZip}")
          }
        }
      }
      failure {
        script {
          if (params.SLACK_NOTIF) {
            slackSend(
              color: '#AA0000',
              channel: slackChannel,
              message: "FAILURE: Release *${starterKitArtifactId}* & *${themeArtifactId}* `version ${params.VERSION}`")
          }
        } 
      }
   }
 }
 