export function messageConnectionSuccess(title: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LetsApp - Sucesso</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: white;
    }
    .container {
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      max-width: 400px;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 10px 0; font-size: 24px; }
    p { margin: 0 0 20px 0; opacity: 0.9; font-size: 16px; }
    .close-btn {
      background: rgba(255,255,255,0.2);
      border: 2px solid white;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
    }
    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }
  </style>
  <script type="text/javascript">
    window.onload = function() {
      let appOpened = false;
      
      // Detecta se o app foi aberto monitorando blur/visibilitychange
      const detectAppOpen = () => {
        appOpened = true;
      };
      
      window.addEventListener('blur', detectAppOpen);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) detectAppOpen();
      });

      // Tenta abrir o deep link
      const deepLink = 'lets-app://';
      window.location.href = deepLink;

      // Aguarda e verifica se o app abriu
      setTimeout(function() {
        if (!appOpened) { 
          // Se o app não abriu, mostra opções
          const container = document.querySelector('.container');
          container.innerHTML = \`
            <div class="success-icon">✅</div>
            <h1>${title} Conectado!</h1>
            <p>Sua conta foi vinculada com sucesso!</p>
            <p style="font-size: 14px; opacity: 0.8;">Volte para o aplicativo LetsApp para continuar.</p>
            <button class="close-btn" onclick="window.close()">Fechar esta janela</button>
          \`;
        }
      }, 1500);
    };
  </script>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>${title} Conectado!</h1>
    <p>Redirecionando para o aplicativo...</p>
  </div>
</body>
</html>
  `;
}
