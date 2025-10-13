 export function messageConnectionSuccess(title: string): string {
    return `
        <!DOCTYPE html>
        <html>
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
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 { margin: 0 0 10px 0; }
            p { margin: 0 0 20px 0; opacity: 0.9; }
            .countdown { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>${title} Conectado!</h1>
            <p>Sua conta foi vinculada com sucesso ao LetsApp</p>
            <p class="countdown">Fechando em <span id="timer">3</span> segundos...</p>
          </div>

          <script>
            let countdown = 3;
            const timer = document.getElementById('timer');

            const interval = setInterval(() => {
              countdown--;
              timer.textContent = countdown;

              if (countdown <= 0) {
                clearInterval(interval);
                window.close();
                // Fallback para dispositivos que não permitem window.close()
                document.body.innerHTML = '<div style="text-align:center; padding:40px;"><h2>✅ Sucesso!</h2><p>Você pode fechar esta aba agora</p></div>';
                window.location.href = 'https://letsapp.com.br/conexao-sucesso';

              }
            }, 1000);
          </script>
        </body>
        </html>
      `;
  }