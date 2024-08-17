let deferredPrompt;


window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('用户接受了安装提示');
            loadWebApp();
        }
        deferredPrompt = null;
    }
});

function loadWebApp() {
    const appContainer = document.getElementById('app-container');
    appContainer.style.display = 'block';
    appContainer.innerHTML = '<iframe src="/adsdemo/app-shell.html" style="width:100%;height:100%;border:none;"></iframe>';
    document.getElementById('installBtn').style.display = 'none';
}

// 如果PWA已经安装,直接加载Web应用
if (window.matchMedia('(display-mode: standalone)').matches) {
    loadWebApp();
}