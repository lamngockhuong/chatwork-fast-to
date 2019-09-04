(() => {
    class Common {
        generateCurrentYear() {
            document.getElementById('current-year').innerHTML = new Date().getFullYear();
        }

        generateFunnyMessage() {
            var messages = [
                "Good morning :))",
                "Good afternoon :v",
                "Good evening :D",
                "Good night zZz",
                "Future depends on your dreams. So go to sleep.",
                "Behind every successful man, there is a woman. And behind every unsuccessful man, there are two or more.",
                "Money is not the only thing, it’s everything.",
                "I don’t get older. I level up.",
                "The more you learn, the more you know, the more you know, and the more you forget. The more you forget, the less you know. So why bother to learn.",
                "Practice makes perfect…But nobody’s perfect… so why practice?",
                "Procrastination is the greatest laborsaving invention of all time",
                "Laziness- Nothing more the the habit of resting before you get tired",
                "The trouble with being pungtual is that nobody’s there to appreciate.",
                "I love you – Like a dentist loves crooked teeth",
                "If each day is a gift – I’d like to know where to return Mondays.",
                "If a person can smile when things go wrong, He has someone in mine to blame.",
                "I found your NOSE! It was in my business again.",
                "If I could remember school work like I remember lyrics… I would be a genius.",
                "I hate how after an argument I think of more clever things I should have said.",
                "If sleep is SO important… why does school start so early?",
                "My wallet is like an onion. When I open it, I cry.",
                "No woman ever shot her husband while he did the dishes.",
                "I say no to alcohol, it just doesn't listen.",
                "Don't blame yourself. Let me do it.",
                "Those who laugh last thinks slowest.",
                "If the world were ruled by women, then there would be no war… Just couple of nations not talking with each other."
            ];

            var msg = messages[Math.floor(Math.random() * (messages.length))];
            document.getElementById('fast-to-funny-message').innerHTML = msg;
        }

        init() {
            this.generateCurrentYear();
            this.generateFunnyMessage();
            setInterval(() => {
                this.generateFunnyMessage()
            }, 600000);
        }
    }

    let common = new Common();

    common.init();
})();
