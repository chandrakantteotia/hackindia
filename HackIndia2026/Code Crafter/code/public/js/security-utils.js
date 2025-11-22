// ============================================
// SHARPPLAY SECURITY UTILITIES
// Reusable across all games
// ============================================

const SharpPlaySecurity = {
    // Configuration
    config: {
        encryptionKey: 'SharpPlay2025_Secure_Key',
        userId: 'KunalDev69', // Replace with actual user ID
        rateLimit: {
            maxAttempts: 5,
            timeWindow: 300000 // 5 minutes
        }
    },

    // ============================================
    // ENCRYPTION & DATA SECURITY
    // ============================================

    encrypt(data) {
        let encrypted = '';
        const str = JSON.stringify(data);
        for (let i = 0; i < str.length; i++) {
            encrypted += String.fromCharCode(
                str.charCodeAt(i) ^ this.config.encryptionKey.charCodeAt(i % this.config.encryptionKey.length)
            );
        }
        return btoa(encrypted);
    },

    decrypt(encrypted) {
        try {
            let decrypted = '';
            const decoded = atob(encrypted);
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(
                    decoded.charCodeAt(i) ^ this.config.encryptionKey.charCodeAt(i % this.config.encryptionKey.length)
                );
            }
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('❌ Decryption failed:', error);
            return null;
        }
    },

    generateChecksum(data) {
        let hash = 0;
        const str = JSON.stringify(data);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    secureStore(key, data) {
        const encrypted = this.encrypt(data);
        const checksum = this.generateChecksum(data);
        localStorage.setItem(key, encrypted);
        localStorage.setItem(key + '_checksum', checksum);
        console.log('✅ Data stored securely:', key);
    },

    secureLoad(key) {
        const encrypted = localStorage.getItem(key);
        const storedChecksum = localStorage.getItem(key + '_checksum');
        
        if (!encrypted || !storedChecksum) {
            return null;
        }
        
        const data = this.decrypt(encrypted);
        if (!data) return null;
        
        const currentChecksum = this.generateChecksum(data);
        if (currentChecksum !== storedChecksum) {
            console.error('⚠️ DATA TAMPERING DETECTED for key:', key);
            this.logTampering(key);
            return null;
        }
        
        return data;
    },

    logTampering(key) {
        const tamperLog = this.secureLoad('tamper_log') || [];
        tamperLog.push({
            key: key,
            timestamp: Date.now(),
            user: this.config.userId
        });
        this.secureStore('tamper_log', tamperLog);
    },

    // ============================================
    // RATE LIMITING
    // ============================================

    rateLimiter: {
        attempts: {},

        check(action, maxAttempts, timeWindow) {
            const now = Date.now();
            const key = action + '_' + SharpPlaySecurity.config.userId;
            
            if (!this.attempts[key]) {
                this.attempts[key] = [];
            }
            
            // Remove old attempts
            this.attempts[key] = this.attempts[key].filter(
                timestamp => now - timestamp < timeWindow
            );
            
            if (this.attempts[key].length >= maxAttempts) {
                const oldestAttempt = this.attempts[key][0];
                const waitTime = Math.ceil((timeWindow - (now - oldestAttempt)) / 1000);
                return {
                    allowed: false,
                    waitTime: waitTime,
                    message: `⚠️ Too many attempts! Please wait ${waitTime} seconds.`
                };
            }
            
            this.attempts[key].push(now);
            return {
                allowed: true,
                remainingAttempts: maxAttempts - this.attempts[key].length
            };
        },

        reset(action) {
            const key = action + '_' + SharpPlaySecurity.config.userId;
            delete this.attempts[key];
        }
    },

    // ============================================
    // SCORE VALIDATION
    // ============================================

    validateScore(score, gameType, playDuration) {
        const maxScores = {
            'tap-reaction': 2000,
            'memory-match': 10000,
            'color-rush': 5000,
            'sharp-shooter': 2000
        };

        const minPlayTimes = {
            'tap-reaction': 10000,
            'memory-match': 15000,
            'color-rush': 10000,
            'sharp-shooter': 5000
        };

        const validations = {
            scoreInRange: score >= 0 && score <= (maxScores[gameType] || 10000),
            playTimeValid: playDuration >= (minPlayTimes[gameType] || 5000),
            scoreReasonable: score / (playDuration / 1000) < 200, // Max 200 pts/sec
            isInteger: Number.isInteger(score)
        };

        const failed = Object.entries(validations).filter(([_, passed]) => !passed);
        
        if (failed.length > 0) {
            console.error('❌ Validation failed:', failed.map(([check]) => check));
            return false;
        }

        console.log('✅ Score validation passed');
        return true;
    },

    // ============================================
    // ANTI-CHEAT BEHAVIORAL ANALYSIS
    // ============================================

    antiCheat: {
        session: {
            startTime: null,
            clicks: [],
            mouseMovements: [],
            keyPresses: [],
            focusLost: 0
        },

        init() {
            this.session.startTime = Date.now();
            this.session.clicks = [];
            this.session.mouseMovements = [];
            this.session.keyPresses = [];
            this.session.focusLost = 0;

            // Track mouse
            document.addEventListener('mousemove', (e) => {
                if (this.session.mouseMovements.length < 1000) {
                    this.session.mouseMovements.push({
                        x: e.clientX,
                        y: e.clientY,
                        timestamp: Date.now()
                    });
                }
            });

            // Track focus
            window.addEventListener('blur', () => {
                this.session.focusLost++;
            });

            console.log('✅ Anti-cheat initialized');
        },

        recordClick(x, y) {
            this.session.clicks.push({
                x: x,
                y: y,
                timestamp: Date.now()
            });
        },

        analyze() {
            const warnings = [];

            // Check timing consistency
            if (this.session.clicks.length > 5) {
                const intervals = [];
                for (let i = 1; i < this.session.clicks.length; i++) {
                    intervals.push(
                        this.session.clicks[i].timestamp - this.session.clicks[i-1].timestamp
                    );
                }

                const avg = intervals.reduce((a,b) => a+b, 0) / intervals.length;
                const variance = intervals.reduce((sum, val) => 
                    sum + Math.pow(val - avg, 2), 0) / intervals.length;

                if (variance < 100) {
                    warnings.push('Suspiciously consistent click timing (bot-like)');
                }

                const fastClicks = intervals.filter(i => i < 50);
                if (fastClicks.length > 5) {
                    warnings.push('Inhuman reaction times detected (<50ms)');
                }
            }

            // Check mouse movement
            if (this.session.mouseMovements.length < 10) {
                warnings.push('Insufficient mouse movement (automation suspected)');
            }

            // Check focus loss
            if (this.session.focusLost > 3) {
                warnings.push('Multiple focus losses (multi-tasking/botting)');
            }

            return {
                passed: warnings.length < 2,
                warnings: warnings,
                confidence: Math.min((warnings.length / 3) * 100, 100),
                risk: warnings.length === 0 ? 'LOW' : warnings.length === 1 ? 'MEDIUM' : 'HIGH'
            };
        },

        getReport() {
            const analysis = this.analyze();
            return {
                duration: Date.now() - this.session.startTime,
                totalClicks: this.session.clicks.length,
                mouseMovements: this.session.mouseMovements.length,
                focusLost: this.session.focusLost,
                analysis: analysis,
                timestamp: Date.now()
            };
        },

        reset() {
            this.session = {
                startTime: Date.now(),
                clicks: [],
                mouseMovements: [],
                keyPresses: [],
                focusLost: 0
            };
        }
    },

    // ============================================
    // INPUT SANITIZATION
    // ============================================

    sanitizeInput(input) {
        if (typeof input !== 'string') {
            input = String(input);
        }

        // Create temporary div for HTML encoding
        const div = document.createElement('div');
        div.textContent = input;
        let sanitized = div.innerHTML;

        // Remove dangerous patterns
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');

        // Limit length
        sanitized = sanitized.substring(0, 200);

        return sanitized;
    },

    // ============================================
    // TIMESTAMP VALIDATION
    // ============================================

    validateTimestamp(clientTimestamp, maxDrift = 60000) {
        const serverTime = Date.now();
        const difference = Math.abs(serverTime - clientTimestamp);

        if (difference > maxDrift) {
            console.error('⚠️ Clock manipulation detected! Drift:', difference, 'ms');
            return false;
        }

        return true;
    },

    // ============================================
    // SECURE BALANCE MANAGEMENT
    // ============================================

    getBalance() {
        const balanceData = this.secureLoad('sharpBalance');
        return balanceData ? balanceData.amount : 0;
    },

    addBalance(amount) {
        const currentBalance = this.getBalance();
        const newBalance = currentBalance + amount;
        
        this.secureStore('sharpBalance', {
            amount: newBalance,
            lastUpdated: Date.now(),
            user: this.config.userId
        });

        console.log('✅ Balance updated:', newBalance.toFixed(2), 'SHARP');
        return newBalance;
    },

    // ============================================
    // DAILY LIMIT CHECK
    // ============================================

    canPlayToday(gameType) {
        const lastPlayed = this.secureLoad(`lastPlayed_${gameType}`);
        if (!lastPlayed) return true;

        const lastDate = new Date(lastPlayed.timestamp);
        const today = new Date();

        return lastDate.getDate() !== today.getDate() ||
               lastDate.getMonth() !== today.getMonth() ||
               lastDate.getFullYear() !== today.getFullYear();
    },

    markAsPlayed(gameType, score) {
        this.secureStore(`lastPlayed_${gameType}`, {
            timestamp: Date.now(),
            score: score,
            user: this.config.userId
        });
    },

    // ============================================
    // COMPREHENSIVE SECURITY REPORT
    // ============================================

    generateSecurityReport(gameType, score, playDuration) {
        const antiCheatReport = this.antiCheat.getReport();
        const scoreValid = this.validateScore(score, gameType, playDuration);
        const timestampValid = this.validateTimestamp(Date.now());

        return {
            user: this.config.userId,
            gameType: gameType,
            score: score,
            playDuration: playDuration,
            timestamp: Date.now(),
            validation: {
                scoreValid: scoreValid,
                timestampValid: timestampValid,
                antiCheatPassed: antiCheatReport.analysis.passed,
                overallValid: scoreValid && timestampValid && antiCheatReport.analysis.passed
            },
            antiCheat: antiCheatReport,
            security: {
                encryptionActive: true,
                rateLimitActive: true,
                dailyLimitActive: true
            }
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharpPlaySecurity;
}