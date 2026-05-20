from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import json

app = Flask(__name__)
CORS(app)

class PasswordAnalyzer:
    """Comprehensive password strength analyzer"""
    
    def __init__(self, password):
        self.password = password
        self.length = len(password)
        
    def check_criteria(self):
        """Check all password criteria"""
        return {
            'length': self.length >= 8,
            'uppercase': bool(re.search(r'[A-Z]', self.password)),
            'lowercase': bool(re.search(r'[a-z]', self.password)),
            'numbers': bool(re.search(r'\d', self.password)),
            'special': bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', self.password)),
        }
    
    def check_common_patterns(self):
        """Detect common weak patterns"""
        patterns = {
            'sequential': bool(re.search(r'(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', self.password.lower())),
            'repeated': bool(re.search(r'(.)\1{2,}', self.password)),
            'keyboard': bool(re.search(r'(qwerty|asdfgh|zxcvbn|qazwsx)', self.password.lower())),
        }
        return patterns
    
    def calculate_entropy(self):
        """Calculate password entropy"""
        charset_size = 0
        if re.search(r'[a-z]', self.password):
            charset_size += 26
        if re.search(r'[A-Z]', self.password):
            charset_size += 26
        if re.search(r'\d', self.password):
            charset_size += 10
        if re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', self.password):
            charset_size += 32
        
        import math
        entropy = self.length * math.log2(charset_size) if charset_size > 0 else 0
        return round(entropy, 2)
    
    def get_strength_score(self):
        """Calculate overall strength score (0-100)"""
        score = 0
        criteria = self.check_criteria()
        patterns = self.check_common_patterns()
        
        # Base scoring
        score += min(self.length * 4, 40)  # Length contributes up to 40 points
        score += sum(20 for v in criteria.values() if v)  # Each criterion: 20 points
        
        # Penalty for weak patterns
        score -= 20 if patterns['sequential'] else 0
        score -= 15 if patterns['repeated'] else 0
        score -= 20 if patterns['keyboard'] else 0
        
        # Entropy bonus
        entropy = self.calculate_entropy()
        entropy_bonus = min(entropy / 5, 10)  # Up to 10 point bonus
        score += entropy_bonus
        
        return max(0, min(100, int(score)))
    
    def get_strength_level(self, score):
        """Map score to strength level"""
        if score < 20:
            return 'Very Weak'
        elif score < 40:
            return 'Weak'
        elif score < 60:
            return 'Fair'
        elif score < 80:
            return 'Strong'
        else:
            return 'Very Strong'
    
    def get_recommendations(self):
        """Generate improvement recommendations"""
        recommendations = []
        criteria = self.check_criteria()
        patterns = self.check_common_patterns()
        
        if self.length < 8:
            recommendations.append('Increase password length to at least 8 characters')
        if self.length < 12:
            recommendations.append('Consider using 12+ characters for better security')
        if not criteria['uppercase']:
            recommendations.append('Add uppercase letters (A-Z)')
        if not criteria['lowercase']:
            recommendations.append('Add lowercase letters (a-z)')
        if not criteria['numbers']:
            recommendations.append('Include numbers (0-9)')
        if not criteria['special']:
            recommendations.append('Add special characters (!@#$%^&*)')
        if patterns['sequential']:
            recommendations.append('Avoid sequential characters (abc, 123)')
        if patterns['repeated']:
            recommendations.append('Avoid repeating characters (aaa, 111)')
        if patterns['keyboard']:
            recommendations.append('Avoid keyboard patterns (qwerty, asdfgh)')
        
        return recommendations
    
    def analyze(self):
        """Complete password analysis"""
        criteria = self.check_criteria()
        patterns = self.check_common_patterns()
        score = self.get_strength_score()
        strength = self.get_strength_level(score)
        entropy = self.calculate_entropy()
        recommendations = self.get_recommendations()
        
        return {
            'strength': strength,
            'score': score,
            'entropy': entropy,
            'criteria': criteria,
            'patterns': patterns,
            'recommendations': recommendations,
            'crackTime': self.estimate_crack_time(entropy)
        }
    
    def estimate_crack_time(self, entropy):
        """Estimate time to crack password"""
        # Assuming 10 billion guesses per second
        guesses_per_second = 10_000_000_000
        total_combinations = 2 ** entropy
        seconds = total_combinations / (2 * guesses_per_second)
        
        if seconds < 1:
            return "Less than a second"
        elif seconds < 60:
            return f"{int(seconds)} seconds"
        elif seconds < 3600:
            return f"{int(seconds/60)} minutes"
        elif seconds < 86400:
            return f"{int(seconds/3600)} hours"
        elif seconds < 31536000:
            return f"{int(seconds/86400)} days"
        else:
            return f"{int(seconds/31536000)} years"

@app.route('/api/check-password', methods=['POST'])
def check_password():
    """Analyze password strength"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        analyzer = PasswordAnalyzer(password)
        result = analyzer.analyze()
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-password', methods=['POST'])
def generate_password():
    """Generate a strong random password"""
    try:
        import random
        import string
        
        data = request.get_json()
        length = data.get('length', 16)
        
        # Ensure length is between 8 and 128
        length = max(8, min(128, length))
        
        # Character sets
        lowercase = string.ascii_lowercase
        uppercase = string.ascii_uppercase
        digits = string.digits
        special = '!@#$%^&*()_+-=[]{};<>?,.'
        
        # Ensure at least one from each set
        chars = [
            random.choice(lowercase),
            random.choice(uppercase),
            random.choice(digits),
            random.choice(special)
        ]
        
        # Fill remaining with random characters from all sets
        all_chars = lowercase + uppercase + digits + special
        chars.extend(random.choice(all_chars) for _ in range(length - 4))
        
        # Shuffle to avoid predictable patterns
        random.shuffle(chars)
        generated_password = ''.join(chars)
        
        # Analyze the generated password
        analyzer = PasswordAnalyzer(generated_password)
        result = analyzer.analyze()
        result['password'] = generated_password
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
