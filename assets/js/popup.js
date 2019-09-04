(() => {
    class Popup {
        constructor() {
            // check and open chatwork page
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                var tab = tabs[0];
                const url = new URL(tab.url);
                if (url.hostname !== 'www.chatwork.com') {
                    window.open('https://chatwork.com');
                }
            });
        }

        scriptFastTO(message) {
            return `
                document.getElementById('_chatText').value = \`${message}\`;
                document.getElementById('_sendButton').click();
            `;
        }

        scriptLoadPage(url) {
            return `
                window.location.href = '${url}';
            `;
        }

        escapeSpecialChars(str) {
            return str
                .replace(/[\\]/g, "\\\\")
                .replace(/[`]/g, "\\`")
                .replace(/(\${)/g, "$\\{");
        }

        getSomeChars(str, length) {
            return (str.length > length) ? `${str.substr(0, length)}...` : str;
        }

        getToItemHtml(message, index) {
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center"
                    data-container="body"
                    data-toggle="popover"
                    data-placement="top"
                    data-trigger="hover"
                    data-message="${message.message}"
                    data-content="${this.getSomeChars(message.message, 300)}"
                    data-box="${message.box}"
                    data-original-title="${this.getSomeChars(message.title, 150)}">
                    ${this.getSomeChars(message.title, 35)}
                    <span class="badge badge-primary badge-pill">${++index}</span>
                </li>
            `;
        }

        insertNewToItem(message, index) {
            $(".list-to ul.list-group").append(this.getToItemHtml(message, index));
        }

        renderFastToMessages() {
            var self = this;

            // generate list messages
            this.messages.filter((message) => message.active).forEach((message, index) => {
                this.insertNewToItem(message, index);
            });

            // TO button
            $(".list-to ul.list-group li.list-group-item").hover(function () {
                var $button = $("<button class='to-button btn btn-success btn-sm' role='button'>TO</button>");
                $(this).append($button);
            }, function () {
                $(this).find("button.to-button").last().remove();
            });

            // popover
            $('.bs-component [data-toggle="popover"]').popover();

            // send message event
            $('.list-to ul li.list-group-item').on('click', '.to-button', function (e) {
                let message = $(this).parent().data("message");
                let box = $(this).parent().data("box");

                chrome.tabs.executeScript({
                    code: self.scriptLoadPage(box)
                });

                chrome.tabs.onUpdated.addListener(function sendMessage(tabId, changeInfo, tab) {
                    if (changeInfo.status == 'complete' && tab.url == box) {
                        chrome.tabs.onUpdated.removeListener(sendMessage);
                        chrome.tabs.executeScript({
                            code: self.scriptFastTO(self.escapeSpecialChars(message))
                        });
                    }
                });
            });
        }

        onStorageSync(storage) {
            this.messages = storage.messages;
        }

        onSetupComplete() {
            this.renderFastToMessages();
        }

        setup(callback) {
            chrome.storage.local.get(['messages'], (storage) => {
                this.onStorageSync(storage);

                callback();
            });
        }

        init() {
            this.setup(this.onSetupComplete.bind(this));
        }
    }

    let popup = new Popup();

    popup.init();
})();

