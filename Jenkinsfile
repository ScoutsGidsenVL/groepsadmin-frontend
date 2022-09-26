pipeline {
  agent any

  options {
    buildDiscarder(logRotator(artifactNumToKeepStr: '10'))
  }

  stages {
    stage('build') {
      steps {
        sh "npm prune --ignore-scripts"
        sh "npm install --ignore-scripts"
        sh "rm -rf dist frontend.zip"
        sh "npm run build"
        sh "zip -r frontend.zip dist/*"
      }
    }

    stage('archive') {
      steps {
        archiveArtifacts  'frontend.zip'

        script{
            def artifactory = Artifactory.server 'artifactory'

            def uploadSpec = '''{
              "files": [
                {
                  "pattern": "frontend.zip",
                  "target": "groepsadmin-frontend/${BRANCH_NAME}/${BUILD_ID}/"
                }
             ]
            }'''

            def buildInfo = artifactory.upload spec: uploadSpec

            artifactory.publishBuildInfo buildInfo
        }
      }
    }

    stage('deploy') {
      steps {
        sh 'ssh az-deb-mgmt sudo -u ansible /opt/deploy-ga.sh client ${BRANCH_NAME}'
      }
    }
  }

  post {
    failure {
      emailen()
    }
    unstable {
      emailen()
    }
    changed {
      emailen()
    }
  }
}

def emailen() {
  mail(
    to: "tvl@scoutsengidsenvlaanderen.be,${env.CHANGE_AUTHOR_EMAIL},jr@scoutsengidsenvlaanderen.be",
    subject: "[Jenkins] ${currentBuild.fullDisplayName} ${currentBuild.currentResult}",
    body: """${currentBuild.fullDisplayName} ${currentBuild.currentResult}

${currentBuild.absoluteUrl}"""
  )
}
