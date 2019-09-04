(() => {
    class App {
        constructor(node) {
            this.hostNameAllowed = 'chatwork.com';
            this.node = document.querySelector(node);

            this.tableBody = this.node.querySelector('[data-fast-to="table-body"]');
            this.tablePagination = this.node.querySelector('[data-fast-to="table-pagination"]');
            this.messageForm = this.node.querySelector('[data-fast-to="message-form"]');
            this.addMessageForm = this.node.querySelector('[data-fast-to="add-message-form"]');
            this.addMessageBtn = this.node.querySelector('[data-fast-to="add-message-btn"]');

            this.inputAddTitle = this.node.querySelector('[data-fast-to="add-title"]');
            this.inputAddBox = this.node.querySelector('[data-fast-to="add-box"]');
            this.inputAddMessage = this.node.querySelector('[data-fast-to="add-message"]');
            this.btnAdd = this.node.querySelector('[data-fast-to="add-btn"]');

            this.inputUpdateId;
            this.inputUpdateTitle;
            this.inputUpdateBox;
            this.inputUpdateMessage;
            this.btnUpdate;
        }

        guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        escapeHtml(string) {
            var matchHtmlRegExp = /["'&<>]/;

            var str = '' + string;
            var match = matchHtmlRegExp.exec(str);

            if (!match) {
                return str;
            }

            var escape;
            var html = '';
            var index = 0;
            var lastIndex = 0;

            for (index = match.index; index < str.length; index++) {
                switch (str.charCodeAt(index)) {
                    case 34: // "
                        escape = '&quot;';
                        break;
                    case 38: // &
                        escape = '&amp;';
                        break;
                    case 39: // '
                        escape = '&#39;';
                        break;
                    case 60: // <
                        escape = '&lt;';
                        break;
                    case 62: // >
                        escape = '&gt;';
                        break;
                    default:
                        continue;
                }

                if (lastIndex !== index) {
                    html += str.substring(lastIndex, index);
                }

                lastIndex = index + 1;
                html += escape;
            }

            return lastIndex !== index
                ? html + str.substring(lastIndex, index)
                : html;
        }

        notify(msg, type = 'success') {
            $.notify({
                icon: "nc-icon nc-bell-55",
                message: msg
            }, {
                type: type,
                timer: 300,
                placement: {
                    from: 'top',
                    align: 'right'
                }
            });
        }

        validateMessage(inputs) {
            var isValid = [
                /^.{1,100}$/g.test(inputs.title),
                /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi.test(inputs.box)
            ].every((truthy) => truthy);

            if (isValid) {
                var hostname = new URL(inputs.box).hostname;
                return hostname === this.hostNameAllowed || hostname === `www.${this.hostNameAllowed}`;
            }

            return isValid;
        }

        getColumnsHtml(message) {
            return `
                <tr>
                    <td>
                        <div class="form-check">
                            <label class="form-check-label">
                                <input class="form-check-input" data-fast-to="active-row-cb" type="checkbox" value="${message.active}" ${message.active ? ' checked' : ''}>
                                <span class="form-check-sign"></span>
                            </label>
                        </div>
                    </td>
                    <td>
                        <span>${message.title}</span>
                    </td>
                    <td class="td-actions">
                        <button type="button" rel="tooltip" title="Edit message" data-fast-to="edit-row-btn" data-fast-to-message-id="${message.id}"
                            class="btn btn-sx btn-success btn-simple btn-link"><i class="fa fa-edit"></i>
                        </button>
                        <button type="button" rel="tooltip" title="Remove" data-fast-to="delete-row-btn" data-fast-to-message-id="${message.id}"
                            class="btn btn-sx btn-primary btn-simple btn-link"><i class="fa fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        }

        getUpdateMessageFormHtml(message) {
            return `
                <div class="card" data-fast-to="update-message-form">
                    <div class="card-header">
                        <h4 class="card-title">Update message</h4>
                    </div>
                    <div class="card-body">
                        <form>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Title</label>
                                        <input type="hidden" data-fast-to="update-id" value="${message.id}" />
                                        <input type="text" data-fast-to="update-title" class="form-control" placeholder="Message title (Max length: 100)" value="${message.title}" />
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>To box</label>
                                        <input type="text" data-fast-to="update-box" class="form-control" placeholder="Chatwork box url (start with http:// or https://)" value="${message.box}" />
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Message</label>
                                        <textarea data-fast-to="update-message" rows="10" cols="80" class="form-control"
                                            placeholder="Fast TO a message">${message.message}</textarea>
                                    </div>
                                </div>
                            </div>
                            <button type="button" data-fast-to="update-btn" class="btn btn-info btn-fill pull-right">Update</button>
                            <div class="clearfix"></div>
                        </form>
                    </div>
                </div>
            `;
        }

        insertTableRow(message) {
            let row = this.tableBody.insertRow(-1);

            row.innerHTML = this.getColumnsHtml(message);

            row.querySelector('[data-fast-to="delete-row-btn"]').addEventListener(
                'click',
                this.deleteMessage.bind(this)
            );

            row.querySelector('[data-fast-to="edit-row-btn"]').addEventListener(
                'click',
                this.showEditMessageForm.bind(this, message)
            );

            row.querySelector('[data-fast-to="active-row-cb"]').addEventListener(
                'click',
                this.handleActiveMessage.bind(this, message)
            );
        }

        renderTable() {
            this.messages.forEach((message) => {
                this.insertTableRow(message);
            });
        }

        clearTable() {
            this.tableBody.innerHTML = '';
        }

        showAddMessageForm() {
            // show add message form
            this.addMessageForm.setAttribute('style', '');

            // hide add message button
            this.addMessageBtn.setAttribute('style', 'display: none;');

            // remove update message form
            let updateForm = this.node.querySelector('[data-fast-to="update-message-form"]');
            if (updateForm) {
                this.messageForm.removeChild(updateForm);
            }
        }

        showEditMessageForm(message) {
            // hide add message form
            this.addMessageForm.setAttribute('style', 'display: none;');

            // show add message button
            this.addMessageBtn.setAttribute('style', '');

            // show update message form
            let updateForm = this.node.querySelector('[data-fast-to="update-message-form"]');
            if (updateForm) {
                this.messageForm.removeChild(updateForm);
            }
            this.messageForm.innerHTML += this.getUpdateMessageFormHtml(message);

            // set event binding for update message form
            this.inputUpdateId = this.node.querySelector('[data-fast-to="update-id"]');
            this.inputUpdateTitle = this.node.querySelector('[data-fast-to="update-title"]');
            this.inputUpdateBox = this.node.querySelector('[data-fast-to="update-box"]');
            this.inputUpdateMessage = this.node.querySelector('[data-fast-to="update-message"]');
            this.btnUpdate = this.node.querySelector('[data-fast-to="update-btn"]');
            this.btnUpdate.addEventListener('click', this.updateMessage.bind(this, message));

            // re-set event for add message form
            this.addMessageForm = this.node.querySelector('[data-fast-to="add-message-form"]');
            this.inputAddTitle = this.node.querySelector('[data-fast-to="add-title"]');
            this.inputAddBox = this.node.querySelector('[data-fast-to="add-box"]');
            this.inputAddMessage = this.node.querySelector('[data-fast-to="add-message"]');
            this.btnAdd = this.node.querySelector('[data-fast-to="add-btn"]');
            this.btnAdd.addEventListener('click', this.addMessage.bind(this));
        }

        addMessage() {
            let newMessage = {
                id: this.guid(),
                title: this.escapeHtml(this.inputAddTitle.value),
                box: this.escapeHtml(this.inputAddBox.value),
                message: this.escapeHtml(this.inputAddMessage.value),
                active: 1
            };

            let valid = this.validateMessage(newMessage);

            if (!valid) {
                this.notify('Add message failure. Please enter correct data', 'danger');
                return;
            }

            this.messages.push(newMessage);

            chrome.storage.local.set(
                {
                    messages: this.messages,
                },
                () => {
                    var error = chrome.runtime.lastError;
                    if (error) {
                        this.notify('Add message failure', 'danger');
                        this.messages.pop();
                    } else {
                        this.inputAddTitle.value = '';
                        this.inputAddBox.value = '';
                        this.inputAddMessage.value = '';

                        this.insertTableRow(newMessage);
                        this.notify('Add message successfully');
                    }
                }
            );
        }

        updateMessage(message) {
            let id = this.inputUpdateId.value;
            let updatedMessage = {
                title: this.escapeHtml(this.inputUpdateTitle.value),
                box: this.escapeHtml(this.inputUpdateBox.value),
                message: this.escapeHtml(this.inputUpdateMessage.value),
                active: 1
            };

            let valid = this.validateMessage(updatedMessage);

            if (!valid) {
                this.notify('Update message failure. Please enter correct data', 'danger');
                return;
            }

            message = this.messages.find((message) => message.id == id);
            message.title = updatedMessage.title;
            message.box = updatedMessage.box;
            message.message = updatedMessage.message;

            chrome.storage.local.set(
                {
                    messages: this.messages,
                },
                () => {
                    var error = chrome.runtime.lastError;
                    if (error) {
                        this.notify('Update message failure', 'danger');
                    } else {
                        this.clearTable();
                        this.renderTable();
                        this.addMessageBtn.click();

                        this.notify('Update message successfully');
                    }
                }
            );
        }

        deleteMessage() {
            let row = event.currentTarget.closest('tr');
            let rowIndex = row.rowIndex - 1;

            this.messages.splice(rowIndex, 1);

            this.tableBody.deleteRow(rowIndex);

            chrome.storage.local.set(
                {
                    messages: this.messages,
                },
                () => {
                    var error = chrome.runtime.lastError;
                    if (!error) {
                        this.notify('Delete message successfully');
                    }
                }
            );
        }

        handleActiveMessage(message) {
            message.active = !message.active;

            chrome.storage.local.set(
                {
                    messages: this.messages,
                },
                null
            );
        }

        setEventBindings() {
            this.btnAdd.addEventListener('click', this.addMessage.bind(this));
            this.addMessageBtn.addEventListener('click', this.showAddMessageForm.bind(this));
        }

        onStorageSync(storage) {
            this.messages = storage.messages;
        }

        onSetupComplete() {
            this.renderTable();
            this.setEventBindings();
        }

        setup(cb) {
            chrome.storage.local.get(['messages'], (storage) => {
                this.onStorageSync(storage);

                cb();
            });
        }

        init() {
            this.setup(this.onSetupComplete.bind(this));
        }
    }

    let app = new App('[data-fast-to="app"]');

    app.init();
})();
