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
      console.log('🔵 Attempting to close window...');
      
      // Method 1: Post message to React Native WebView (works with expo-web-browser)
      try {
        if (window.ReactNativeWebView) {
          console.log('✅ Found ReactNativeWebView, posting message');
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
          return;
        }
      } catch (e) {
        console.log('❌ ReactNativeWebView failed:', e);
      }
      
      // Method 2: Try standard window.close()
      try {
        window.close();
        console.log('✅ window.close() called');
      } catch (e) {
        console.log('❌ window.close() failed:', e);
      }
      
      // Method 3: Try closing for iOS WebView
      try {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dismiss) {
          console.log('✅ iOS webkit dismiss called');
          window.webkit.messageHandlers.dismiss.postMessage('close');
          return;
        }
      } catch (e) {
        console.log('❌ iOS webkit close failed:', e);
      }
      
      // Method 4: Try closing for Android WebView
      try {
        if (typeof Android !== 'undefined' && Android.close) {
          console.log('✅ Android close called');
          Android.close();
          return;
        }
      } catch (e) {
        console.log('❌ Android close failed:', e);
      }
      
      // Method 5: Try navigating back
      try {
        if (window.history.length > 1) {
          console.log('✅ history.back() called');
          window.history.back();
        }
      } catch (e) {
        console.log('❌ history.back() failed:', e);
      }
      
      // Method 6: Final message
      console.log('⚠️ All close methods attempted - please close manually');
    }
    
    window.onload = function() {
      console.log('🔵 Page loaded - starting auto-close sequence');
      let dismissed = false;
      
      // Detecta se o browser foi fechado
      const detectDismiss = () => {
        dismissed = true;
        console.log('✅ Browser dismissed detected');
      };
      
      window.addEventListener('blur', detectDismiss);
      window.addEventListener('pagehide', detectDismiss);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) detectDismiss();
      });

      // Try to auto-close immediately using ReactNativeWebView
      if (window.ReactNativeWebView) {
        console.log('🔵 ReactNativeWebView detected - posting dismiss message');
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
        } catch (e) {
          console.log('❌ Failed to post dismiss message:', e);
        }
      }

      // Show button after a short delay if not dismissed
      setTimeout(function() {
        if (!dismissed) { 
          console.log('⚠️ Auto-close failed - showing manual close button');
          const container = document.querySelector('.container');
          container.innerHTML = \`
            <div class="success-icon">✅</div>
            <h1>${title} Conectado!</h1>
            <p>Sua conta foi vinculada com sucesso!</p>
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 10px;">Você pode fechar esta janela e voltar ao app.</p>
            <button class="close-btn" onclick="tryCloseWindow()" type="button">
              Fechar e Voltar
            </button>
            <p style="font-size: 12px; opacity: 0.7; margin-top: 15px;">Se o botão não funcionar, use o botão "Concluído" ou "X" do navegador.</p>
          \`;
        }
      }, 800);
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
