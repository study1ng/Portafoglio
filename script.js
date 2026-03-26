document.addEventListener(
    "DOMContentLoaded", _ => {
        // タブ切り替えロジック
        document.querySelectorAll("li[id*=nav]").forEach(l => {
            l.addEventListener("click", _ => {
                document.querySelector(".opening").classList.toggle("opening");
                l.classList.toggle("opening");
            }
            )
        }
        )
        // details表示ロジック
        document.querySelectorAll(".expr-title, .my-history-title, .artifact-title").forEach(
            ttl => {
                const container = ttl.closest(".expr, .my-history-box, .artifact");
                const details = container.querySelector(".details");
                if (details === null) {
                    return;
                }

                let hoverTimer = null;
                let hideTimer = null; // コンテナとdetails間の移動を許容するためのタイマー
                let loader = null;

                // マウスの最新座標を保持
                let lastX = 0;
                let lastY = 0;

                const updateLoaderPosition = (e) => {
                    const offsetX = 15;
                    const offsetY = -25;
                    lastX = e.clientX + offsetX;
                    lastY = e.clientY + offsetY;

                    if (loader) {
                        loader.style.left = `${lastX}px`;
                        loader.style.top = `${lastY}px`;
                    }
                };

                const hideProcess = () => {
                    // マウスが要素間を移動する際のわずかな隙間を考慮し、非表示処理に遅延を持たせる
                    hideTimer = setTimeout(() => {
                        clearTimeout(hoverTimer);

                        if (loader) {
                            loader.remove();
                            loader = null;
                        }
                        const iframe = details.querySelector('iframe');
                        if (iframe) {
                            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        }
                        details.classList.remove('is-active');
                    }, 50); // 50msの猶予
                };

                container.addEventListener('mouseenter', (e) => {
                    // 非表示タイマーが動いていればキャンセル（再ホバー時のチラつき防止）
                    clearTimeout(hideTimer);

                    // 既にロード中、または表示済みの場合は新規作成をスキップ
                    if (loader || details.classList.contains('is-active')) return;

                    loader = document.createElement('div');
                    loader.classList.add('loader');
                    container.appendChild(loader);

                    updateLoaderPosition(e);

                    hoverTimer = setTimeout(() => {
                        if (loader) {
                            loader.remove();
                            loader = null;
                        }

                        // 要素の実際のサイズを取得するため、先にクラスを付与して表示状態にする
                        // （JavaScriptの処理内で瞬時に座標補正まで行うため、画面上でチラつくことはありません）
                        details.classList.add('is-active');

                        // details要素の幅と高さを取得
                        const rect = details.getBoundingClientRect();

                        let targetX = lastX;
                        let targetY = lastY;
                        const margin = 20; // 画面端からの余白

                        // 画面右端からはみ出る場合
                        if (targetX + rect.width > window.innerWidth) {
                            targetX = window.innerWidth - rect.width - margin;
                        }

                        // 画面下端からはみ出る場合
                        if (targetY + rect.height > window.innerHeight) {
                            targetY = window.innerHeight - rect.height - margin;
                        }

                        // 画面左端や上端からはみ出る場合のガード（ウィンドウサイズが極端に小さい場合）
                        if (targetX < 0) targetX = margin;
                        if (targetY < 0) targetY = margin;

                        // 計算した安全な座標を適用
                        details.style.left = `${targetX}px`;
                        details.style.top = `${targetY}px`;
                    }, 1000);
                });

                container.addEventListener('mousemove', (e) => {
                    // detailsが表示されていない間（ロード中）のみマウスに追従させる
                    if (!details.classList.contains('is-active')) {
                        updateLoaderPosition(e);
                    }
                });

                container.addEventListener('mouseleave', hideProcess);

                // details上のイベント（マウスがdetailsに乗っている間は消さない）
                details.addEventListener('mouseenter', () => {
                    clearTimeout(hideTimer);
                });

                details.addEventListener('mouseleave', hideProcess);
            }
        );
        // ページ内リンクでタブを切り替える
        document.querySelectorAll("a[href^='#']").forEach(e => {
            const link = e.href.split("#").at(-1);
            const linkedElement = document.getElementById(link);
            const linkedTab = linkedElement.closest("*[id$=tab]");
            const tabName = linkedTab.id.slice(0, -4);
            const navName = `${tabName}-nav`;
            const nav = document.getElementById(navName);
            e.addEventListener("click", _ => {
                document.querySelector(".opening").classList.toggle("opening");
                nav.classList.toggle("opening");
            })
        })
    }
)
