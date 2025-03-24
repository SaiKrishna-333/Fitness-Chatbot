class FitnessCoachChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.micBtn = document.getElementById('mic-btn');
        this.synth = window.speechSynthesis;
        this.userProfile = {
            weight: null,
            height: null,
            goal: null
        };
        this.state = "waiting_for_weight";
        this.setupSpeechRecognition();
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.micBtn.addEventListener('click', () => this.startVoiceInput());
        this.initChat();
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.micBtn.classList.add('listening');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.sendMessage(transcript);
            };

            this.recognition.onend = () => {
                this.micBtn.classList.remove('listening');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.micBtn.classList.remove('listening');
                this.appendMessage('bot-message', "Sorry, I couldn't understand you. Please try again.");
            };
        } else {
            this.micBtn.disabled = true;
            this.appendMessage('bot-message', "Your browser does not support speech recognition.");
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    initChat() {
        this.appendMessage('bot-message', "Hi! I'm your Fitness Coach. Let's start by getting to know you.");
        this.appendMessage('bot-message', "What's your weight in kilograms?");
    }

    sendMessage(message = null) {
        if (!message) {
            message = this.messageInput.value.trim();
        }
        if (!message) return;
        this.appendMessage('user-message', message);
        this.messageInput.value = '';
        this.processMessage(message);
    }

    appendMessage(className, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', className);
        msgDiv.textContent = text;
        this.chatMessages.appendChild(msgDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        this.speak(text);
    }

    speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        this.synth.speak(utterance);
    }

    processMessage(userInput) {
        if (this.state === "waiting_for_weight") {
            this.userProfile.weight = parseFloat(userInput);
            if (!isNaN(this.userProfile.weight)) {
                this.appendMessage('bot-message', "Got it! What's your height in centimeters?");
                this.state = "waiting_for_height";
            } else {
                this.appendMessage('bot-message', "Please enter a valid weight in kilograms.");
            }
        } else if (this.state === "waiting_for_height") {
            this.userProfile.height = parseFloat(userInput);
            if (!isNaN(this.userProfile.height)) {
                this.appendMessage('bot-message', "Great! What's your fitness goal? (Weight Loss, Muscle Gain, Endurance)");
                this.state = "waiting_for_goal";
            } else {
                this.appendMessage('bot-message', "Please enter a valid height in centimeters.");
            }
        } else if (this.state === "waiting_for_goal") {
            this.userProfile.goal = userInput.toLowerCase();
            if (["weight loss", "muscle gain", "endurance"].includes(this.userProfile.goal)) {
                this.appendMessage('bot-message', `Got it! Your goal is ${this.userProfile.goal}.`);
                this.calculateBMI();
                this.state = "waiting_for_activity";
            } else {
                this.appendMessage('bot-message', "Please choose a valid goal: Weight Loss, Muscle Gain, or Endurance.");
            }
        } else if (this.state === "waiting_for_activity") {
            this.provideActivityTips(userInput);
        }
    }

    calculateBMI() {
        const heightInMeters = this.userProfile.height / 100;
        const bmi = (this.userProfile.weight / (heightInMeters * heightInMeters)).toFixed(2);
        this.appendMessage('bot-message', `Your BMI is ${bmi}.`);
        if (bmi < 18.5) {
            this.appendMessage('bot-message', "You are underweight. Focus on a balanced diet and strength training.");
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            this.appendMessage('bot-message', "You have a healthy weight. Keep up the good work!");
        } else {
            this.appendMessage('bot-message', "You are overweight. Focus on cardio and a calorie deficit.");
        }
        this.appendMessage('bot-message', "What activity are you interested in? (Running, Cycling, Swimming)");
    }

    provideActivityTips(activity) {
        activity = activity.toLowerCase();
        if (["running", "cycling", "swimming"].includes(activity)) {
            let tips = "";
            if (activity === "running") {
                tips = `For ${this.userProfile.goal}, run 3-4 times a week for 30-45 minutes. Start with a warm-up and cool-down.`;
            } else if (activity === "cycling") {
                tips = `For ${this.userProfile.goal}, cycle 4-5 times a week for 45-60 minutes. Maintain a steady pace.`;
            } else if (activity === "swimming") {
                tips = `For ${this.userProfile.goal}, swim 3-4 times a week for 30-60 minutes. Focus on technique.`;
            }
            this.appendMessage('bot-message', tips);
        } else {
            this.appendMessage('bot-message', "Please choose a valid activity: Running, Cycling, or Swimming.");
        }
    }
}

new FitnessCoachChatbot();