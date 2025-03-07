// background.js (コンテキストメニューの作成)
chrome.runtime.onInstalled.addListener(() => {
    const menuItems = [
      { id: "copy_normalized_url", title: "URL" },
      { id: "copy_twitter_format", title: "Twitter" },
      { id: "copy_markdown", title: "Markdown" },
      { id: "copy_image_url", title: "画像URL" }
    ];
  
    menuItems.forEach(({ id, title }) => {
      chrome.contextMenus.create({
        id,
        title,
        contexts: ["page"],
        documentUrlPatterns: ["*://www.amazon.co.jp/*"]
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
  
        const title = document.querySelector("#productTitle")?.innerText.trim() ?? "";
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
          navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
            if (result.state === "granted" || result.state === "prompt") {
              navigator.clipboard.writeText(text)
                .then(() => console.log("Copied successfully:", text))
                .catch(err => console.error("Clipboard copy failed:", err));
            } else {
              console.error("Clipboard permission denied");
            }
          });
        } else {
          console.error("No content to copy");
        }
      },
      args: [info.menuItemId]
    });
  });
  