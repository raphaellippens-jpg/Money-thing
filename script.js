/* =========================================================
   MONEY SYSTEM
   localStorage + file vouchers
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const ADMIN_USERNAME = "mom";

const STORAGE_KEY =
    "moneySystemAccounts";

const USED_VOUCHERS_KEY =
    "moneySystemUsedVouchers";


/* =========================================================
   STORAGE
========================================================= */

let accounts =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        )
    ) || {};


let usedVouchers =
    JSON.parse(
        localStorage.getItem(
            USED_VOUCHERS_KEY
        )
    ) || {};


let currentUser = null;


/* =========================================================
   MONEY
========================================================= */

function moneyToCents(amount) {

    return Math.round(
        Number(amount) * 100
    );

}


function centsToMoney(cents) {

    return cents / 100;

}


function cleanMoney(amount) {

    return centsToMoney(
        moneyToCents(amount)
    );

}


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
    );

}


function saveUsedVouchers() {

    localStorage.setItem(
        USED_VOUCHERS_KEY,
        JSON.stringify(usedVouchers)
    );

}


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const createScreen =
    document.getElementById(
        "createScreen"
    );

const userScreen =
    document.getElementById(
        "userScreen"
    );

const adminScreen =
    document.getElementById(
        "adminScreen"
    );

const loginUsername =
    document.getElementById(
        "loginUsername"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const newUsername =
    document.getElementById(
        "newUsername"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const createMessage =
    document.getElementById(
        "createMessage"
    );

const userMessage =
    document.getElementById(
        "userMessage"
    );

const voucherFileInput =
    document.getElementById(
        "voucherFileInput"
    );


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    loginScreen.classList.add(
        "hidden"
    );

    createScreen.classList.add(
        "hidden"
    );

    userScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.add(
        "hidden"
    );

}


function showLogin() {

    hideAllScreens();

    loginScreen.classList.remove(
        "hidden"
    );

}


function showCreateAccount() {

    hideAllScreens();

    createScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

function createAccount() {

    const username =
        newUsername.value.trim();

    const password =
        newPassword.value;


    createMessage.className =
        "message";


    if (!username || !password) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "Enter a username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "That username is reserved.";

        return;
    }


    if (accounts[key]) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "That username already exists.";

        return;
    }


    accounts[key] = {

        username: username,

        password: password,

        balance: 0,

        saved: 0

    };


    saveDatabase();


    createMessage.classList.add(
        "success"
    );


    createMessage.textContent =
        "Account created successfully!";


    newUsername.value = "";

    newPassword.value = "";

}


/* =========================================================
   LOGIN
========================================================= */

function login() {

    const username =
        loginUsername.value.trim();

    const password =
        loginPassword.value;


    loginMessage.className =
        "message";


    if (!username || !password) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Enter your username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    /* MOM */

    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        if (!accounts[key]) {

            accounts[key] = {

                username:
                    ADMIN_USERNAME,

                password:
                    password,

                admin:
                    true,

                balance:
                    0,

                saved:
                    0

            };


            saveDatabase();


            alert(
                "MOM admin account created!"
            );

        }


        if (
            accounts[key].password !==
            password
        ) {

            loginMessage.classList.add(
                "error"
            );

            loginMessage.textContent =
                "Incorrect MOM password.";

            return;
        }


        currentUser = key;

        showAdminPanel();

        return;
    }


    /* NORMAL USER */

    if (!accounts[key]) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Account does not exist.";

        return;
    }


    if (
        accounts[key].password !==
        password
    ) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Incorrect password.";

        return;
    }


    currentUser = key;

    showUserPanel();

}


/* =========================================================
   USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove(
        "hidden"
    );

    updateUserDisplay();

}


function updateUserDisplay() {

    const account =
        accounts[currentUser];


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        account.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        "€" +
        cleanMoney(
            account.balance
        ).toFixed(2);


    document.getElementById(
        "savedValue"
    ).textContent =
        "€" +
        cleanMoney(
            account.saved
        ).toFixed(2);

}


/* =========================================================
   BUY
========================================================= */

function buyMoney() {

    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    const amountCents =
        moneyToCents(amount);


    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    account.balance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Purchase successful!"
    );

}


/* =========================================================
   SAVE
========================================================= */

function saveMoney() {

    const input =
        prompt(
            "How much do you want to save?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    const amountCents =
        moneyToCents(amount);


    const balanceCents =
        moneyToCents(
            account.balance
        );


    const savedCents =
        moneyToCents(
            account.saved
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    account.balance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    account.saved =
        centsToMoney(
            savedCents +
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money saved!"
    );

}


/* =========================================================
   WITHDRAW
========================================================= */

function withdrawMoney() {

    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    const amountCents =
        moneyToCents(amount);


    const savedCents =
        moneyToCents(
            account.saved
        );


    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        savedCents
    ) {

        showUserMessage(
            "🚨 NOT ENOUGH SAVED MONEY!",
            true
        );

        return;
    }


    account.saved =
        centsToMoney(
            savedCents -
            amountCents
        );


    account.balance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money withdrawn!"
    );

}


/* =========================================================
   USER MESSAGE
========================================================= */

function showUserMessage(
    text,
    error = false
) {

    userMessage.className =
        "message";


    if (error) {

        userMessage.classList.add(
            "error"
        );

    } else {

        userMessage.classList.add(
            "success"
        );

    }


    userMessage.textContent =
        text;


    setTimeout(
        function() {

            userMessage.textContent =
                "";

        },
        2500
    );

}


/* =========================================================
   MOM PANEL
========================================================= */

function showAdminPanel() {

    hideAllScreens();

    adminScreen.classList.remove(
        "hidden"
    );

    refreshAdminPanel();

}


/* =========================================================
   ACCOUNT LIST
========================================================= */

function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML = "";


    for (
        const key in accounts
    ) {

        if (
            key ===
            ADMIN_USERNAME.toLowerCase()
        ) {

            continue;
        }


        const account =
            accounts[key];


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "account";


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "accountInfo";


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "accountName";


        name.textContent =
            "👤 " +
            account.username;


        const balance =
            document.createElement(
                "div"
            );


        balance.className =
            "accountMoney";


        balance.textContent =
            "💶 Balance: €" +
            cleanMoney(
                account.balance
            ).toFixed(2);


        const saved =
            document.createElement(
                "div"
            );


        saved.className =
            "accountMoney";


        saved.textContent =
            "🏦 Saved: €" +
            cleanMoney(
                account.saved
            ).toFixed(2);


        info.appendChild(name);

        info.appendChild(balance);

        info.appendChild(saved);


        const buttons =
            document.createElement(
                "div"
            );


        buttons.className =
            "adminButtons";


        const increaseButton =
            document.createElement(
                "button"
            );


        increaseButton.className =
            "increase";


        increaseButton.textContent =
            "➕ Increase balance";


        increaseButton.addEventListener(
            "click",
            function() {

                increaseBalance(key);

            }
        );


        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.className =
            "delete";


        deleteButton.textContent =
            "🗑️ Delete account";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteAccount(key);

            }
        );


        buttons.appendChild(
            increaseButton
        );

        buttons.appendChild(
            deleteButton
        );


        div.appendChild(info);

        div.appendChild(buttons);


        list.appendChild(div);

    }

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

function increaseBalance(key) {

    const account =
        accounts[key];


    if (!account) {
        return;
    }


    const input =
        prompt(
            "Add money to " +
            account.username +
            "'s balance:"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            account.balance
        );


    const amountCents =
        moneyToCents(
            amount
        );


    account.balance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    saveDatabase();

    refreshAdminPanel();


    alert(
        "Added €" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        " to " +
        account.username +
        "'s balance."
    );

}


/* =========================================================
   MOM: DELETE ACCOUNT
========================================================= */

function deleteAccount(key) {

    const account =
        accounts[key];


    if (!account) {
        return;
    }


    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        alert(
            "The MOM account cannot be deleted here."
        );

        return;
    }


    const confirmed =
        confirm(
            "Delete the account '" +
            account.username +
            "'?\n\n" +
            "This will permanently remove " +
            "its Balance and Saved money."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[key];


    saveDatabase();

    refreshAdminPanel();


    alert(
        "Account deleted."
    );

}


/* =========================================================
   DELETE OWN ACCOUNT
========================================================= */

function deleteOwnAccount() {

    if (!currentUser) {
        return;
    }


    const account =
        accounts[currentUser];


    const confirmed =
        confirm(
            "Delete your account '" +
            account.username +
            "'?\n\n" +
            "This will permanently delete " +
            "your Balance and Saved money."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[currentUser];


    saveDatabase();


    currentUser = null;


    alert(
        "Your account has been deleted."
    );


    showLogin();

}


/* =========================================================
   DELETE MOM ACCOUNT
========================================================= */

function deleteMomAccount() {

    if (!currentUser) {
        return;
    }


    const account =
        accounts[currentUser];


    if (!account.admin) {
        return;
    }


    const confirmed =
        confirm(
            "Delete the MOM account?\n\n" +
            "This will permanently delete " +
            "the MOM account."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[currentUser];


    saveDatabase();


    currentUser = null;


    alert(
        "MOM account deleted."
    );


    showLogin();

}


/* =========================================================
   VOUCHER ID
========================================================= */

function createVoucherID() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );

}


/* =========================================================
   CREATE MONEY VOUCHER
========================================================= */

function createMoneyVoucher() {

    const input =
        prompt(
            "What amount should the voucher contain?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    const voucher = {

        type:
            "MONEY_SYSTEM_VOUCHER",

        version:
            1,

        voucherId:
            createVoucherID(),

        amountCents:
            amountCents,

        redeemed:
            false,

        createdBy:
            ADMIN_USERNAME,

        createdAt:
            new Date().toISOString()

    };


    const contents =
        JSON.stringify(
            voucher,
            null,
            2
        );


    const blob =
        new Blob(
            [
                contents
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "MoneyVoucher-" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        ".msv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    alert(
        "🎟️ VOUCHER CREATED!\n\n" +
        "Amount: €" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        "\n\n" +
        "Send the .msv file to the person."
    );

}


/* =========================================================
   OPEN VOUCHER PICKER
========================================================= */

function openVoucherPicker() {

    voucherFileInput.value = "";

    voucherFileInput.click();

}


/* =========================================================
   REDEEM VOUCHER
========================================================= */

async function redeemVoucherFromFile(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        const voucher =
            JSON.parse(
                text
            );


        /* CHECK FORMAT */

        if (
            voucher.type !==
            "MONEY_SYSTEM_VOUCHER"
        ) {

            throw new Error(
                "Invalid voucher."
            );
        }


        if (
            voucher.version !== 1
        ) {

            throw new Error(
                "Unsupported voucher version."
            );
        }


        /* CHECK ID */

        if (
            !voucher.voucherId
        ) {

            throw new Error(
                "Voucher has no ID."
            );
        }


        /* CHECK AMOUNT */

        const amountCents =
            Number(
                voucher.amountCents
            );


        if (
            !Number.isInteger(
                amountCents
            ) ||
            amountCents <= 0
        ) {

            throw new Error(
                "Invalid voucher amount."
            );
        }


        /* CHECK REDEEMED FLAG */

        if (
            voucher.redeemed === true
        ) {

            showUserMessage(
                "🚨 VOUCHER ALREADY REDEEMED!",
                true
            );

            return;
        }


        /* CHECK LOCAL USED LIST */

        if (
            usedVouchers[
                voucher.voucherId
            ]
        ) {

            showUserMessage(
                "🚨 VOUCHER ALREADY USED!",
                true
            );

            return;
        }


        /* SHOW CONFIRMATION */

        const confirmed =
            confirm(
                "🎟️ MONEY VOUCHER\n\n" +
                "Amount: €" +
                centsToMoney(
                    amountCents
                ).toFixed(2) +
                "\n\n" +
                "Redeem this voucher?"
            );


        if (!confirmed) {
            return;
        }


        /* ADD MONEY */

        const account =
            accounts[currentUser];


        const balanceCents =
            moneyToCents(
                account.balance
            );


        account.balance =
            centsToMoney(
                balanceCents +
                amountCents
            );


        /* MARK USED LOCALLY */

        usedVouchers[
            voucher.voucherId
        ] = {

            amountCents:
                amountCents,

            redeemedAt:
                new Date().toISOString()

        };


        saveDatabase();

        saveUsedVouchers();


        /*
           CHANGE THE ACTUAL VOUCHER
           TO REDEEMED = TRUE
        */

        voucher.redeemed =
            true;


        voucher.redeemedBy =
            account.username;


        voucher.redeemedAt =
            new Date().toISOString();


        const redeemedContents =
            JSON.stringify(
                voucher,
                null,
                2
            );


        const redeemedBlob =
            new Blob(
                [
                    redeemedContents
                ],
                {
                    type:
                        "application/json"
                }
            );


        const redeemedURL =
            URL.createObjectURL(
                redeemedBlob
            );


        const redeemedLink =
            document.createElement(
                "a"
            );


        redeemedLink.href =
            redeemedURL;


        redeemedLink.download =
            "REDEEMED-MoneyVoucher-" +
            centsToMoney(
                amountCents
            ).toFixed(2) +
            ".msv";


        document.body.appendChild(
            redeemedLink
        );


        redeemedLink.click();


        redeemedLink.remove();


        URL.revokeObjectURL(
            redeemedURL
        );


        updateUserDisplay();


        showUserMessage(
            "💰 €" +
            centsToMoney(
                amountCents
            ).toFixed(2) +
            " ADDED!"
        );


    } catch (error) {

        console.error(
            "Voucher error:",
            error
        );


        showUserMessage(
            "🚨 INVALID VOUCHER FILE!",
            true
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;


    loginUsername.value = "";

    loginPassword.value = "";

    loginMessage.textContent = "";


    showLogin();

}


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "loginButton"
    )
    .addEventListener(
        "click",
        login
    );


document
    .getElementById(
        "showCreateButton"
    )
    .addEventListener(
        "click",
        showCreateAccount
    );


document
    .getElementById(
        "createButton"
    )
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById(
        "backToLoginButton"
    )
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById(
        "buyButton"
    )
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById(
        "withdrawButton"
    )
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById(
        "userLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "adminLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "deleteOwnAccountButton"
    )
    .addEventListener(
        "click",
        deleteOwnAccount
    );


document
    .getElementById(
        "deleteMomButton"
    )
    .addEventListener(
        "click",
        deleteMomAccount
    );


document
    .getElementById(
        "createVoucherButton"
    )
    .addEventListener(
        "click",
        createMoneyVoucher
    );


document
    .getElementById(
        "redeemVoucherButton"
    )
    .addEventListener(
        "click",
        openVoucherPicker
    );


voucherFileInput.addEventListener(
    "change",
    redeemVoucherFromFile
);


/* =========================================================
   ENTER KEY
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            login();

        }

    }
);


newPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            createAccount();

        }

    }
);


/* =========================================================
   START
========================================================= */

showLogin();
