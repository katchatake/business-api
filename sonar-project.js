const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://localhost:9000',
    options: {
      'sonar.projectName': 'Mi-Proyecto-Node',
      'sonar.projectKey': 'node-app-key',
      'sonar.sources': '.', // Analiza toda la carpeta actual
      'sonar.exclusions': 'node_modules/**,test/**', // Ignora librerías
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      // 'sonar.login': 'admin', 
      // 'sonar.password': 'K@lculador45' // La que cambies al iniciar
      'sonar.token': 'squ_44e7abe44a05060197066781835353433067b3c8'
    }
  },
  () => process.exit()
);