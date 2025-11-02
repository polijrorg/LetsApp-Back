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
      border-width: 2px;
      font-weight: 600;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .close-btn:hover, .close-btn:active {
      background: rgba(255,255,255,0.3);
      transform: scale(0.98);
    }
  </style>
  <script type="text/javascript">
    function tryCloseWindow() {
      // Method 1: Try standard window.close()
      try {
        window.close();
      } catch (e) {
        console.log('window.close() failed:', e);
      }
      
      // Method 2: Try closing for iOS WebView
      try {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dismiss) {
          window.webkit.messageHandlers.dismiss.postMessage('close');
          return;
        }
      } catch (e) {
        console.log('iOS webkit close failed:', e);
      }
      
      // Method 3: Try closing for Android WebView
      try {
        if (typeof Android !== 'undefined' && Android.close) {
          Android.close();
          return;
        }
      } catch (e) {
        console.log('Android close failed:', e);
      }
      
      // Method 4: Post message to parent (for expo-web-browser)
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('close');
          return;
        }
      } catch (e) {
        console.log('ReactNativeWebView close failed:', e);
      }
      
      // Method 5: Try navigating back
      try {
        window.history.back();
      } catch (e) {
        console.log('history.back() failed:', e);
      }
      
      // Method 6: Final fallback - redirect to deep link again
      setTimeout(() => {
        window.location.href = 'lets-app://';
      }, 100);
    }
    
    window.onload = function() {
      let appOpened = false;
      let deepLinkAttempted = false;
      
      // Detecta se o app foi aberto
      const detectAppOpen = () => {
        appOpened = true;
      };
      
      window.addEventListener('blur', detectAppOpen);
      window.addEventListener('pagehide', detectAppOpen);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) detectAppOpen();
      });

      // Função para tentar abrir o deep link
      function attemptDeepLink() {
        if (deepLinkAttempted) return;
        deepLinkAttempted = true;
        
        const deepLink = 'lets-app://callback';
        
        // Tenta diferentes métodos de abrir o deep link
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = deepLink;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.location.href = deepLink;
        }, 25);
      }

      // Inicia o processo de deep link
      attemptDeepLink();

      // Aguarda para verificar se o app abriu
      setTimeout(function() {
        if (!appOpened) { 
          // Se o app não abriu, mostra o botão
          const container = document.querySelector('.container');
          container.innerHTML = \`
            <div class="success-icon">✅</div>
            <h1>${title} Conectado!</h1>
            <p>Sua conta foi vinculada com sucesso!</p>
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">Você pode fechar esta janela e voltar ao app.</p>
            <button class="close-btn" onclick="tryCloseWindow()" type="button">
              Voltar para o App
            </button>
          \`;
        }
      }, 1000);
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
