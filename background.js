// background.js (コンテキストメニューの作成)
chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
    { id: "copy_normalized_url", title: "URL" },
    { id: "copy_twitter_format", title: "Twitter" },
    { id: "copy_markdown", title: "Markdown" },
    { id: "copy_image_url", title: "画像URL" },
  ];

  menuItems.forEach(({ id, title }) => {
    chrome.contextMenus.create({
      id,
      title,
      contexts: ["page"],
      documentUrlPatterns: ["*://www.amazon.co.jp/*"],
    });
  });
});

// メニュークリック時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: (menuItemId) => {
      const normalizeAmazonURL = (url) => {
        const match = url.match(/\/dp\/(\w+)/);
        return match ? `https://www.amazon.co.jp/dp/${match[1]}` : url;
      };

      const title =
        document.querySelector("#productTitle")?.innerText.trim() ?? "";
      const url = normalizeAmazonURL(window.location.href);
      const imageUrl = document.querySelector("#landingImage")?.src ?? "";

      let text = "";
      switch (menuItemId) {
        case "copy_normalized_url":
          text = url;
          break;
        case "copy_twitter_format":
          text = `${title} ${url}`;
          break;
        case "copy_markdown":
          text = `[${title}](${url})`;
          break;
        case "copy_image_url":
          text = imageUrl;
          break;
      }

      if (text) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            const toast = document.createElement("div");
            toast.innerText = "コピーしました";
            toast.style.position = "fixed";
            toast.style.bottom = "20px";
            toast.style.right = "20px";
            toast.style.background = "rgba(0, 0, 0, 0.7)";
            toast.style.color = "#fff";
            toast.style.padding = "10px 15px";
            toast.style.borderRadius = "5px";
            toast.style.fontSize = "14px";
            toast.style.zIndex = "10000";
            toast.style.opacity = "1";
            toast.style.transition = "opacity 0.5s ease-in-out";

            document.body.appendChild(toast);
            setTimeout(() => {
              toast.style.opacity = "0";
              setTimeout(() => document.body.removeChild(toast), 500);
            }, 1000);
          })
          .catch((err) => console.error("Clipboard copy failed:", err));
      } else {
        console.error("No content to copy");
      }
    },
    args: [info.menuItemId],
  });
});
