pipeline {
    agent any
    tools { nodejs 'NodeJS-18' }
    triggers { githubPush() }
    stages {
        stage('Install & Build') {
            steps {
                sh 'cd booknest-react && npm install && npm run build'
            }
        }
        stage('Deploy to Vercel') {
            environment {
                VERCEL_TOKEN = credentials('vercel-token')
            }
            steps {
                sh '''
                    npm install -g vercel
                    cd booknest-react
                    vercel --prod --token=$VERCEL_TOKEN --yes
                '''
            }
        }
    }
    post {
        success { echo 'Frontend deployed to Vercel!' }
        failure { echo 'Frontend deployment failed!' }
    }
}