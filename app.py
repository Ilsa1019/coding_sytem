import datetime
import hashlib
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# List of fortunes, details, lucky items/colors
FORTUNES = [
    {"rank": "超大吉", "score": 100, "message": "奇跡のような一日！何をやっても上手くいき、願っていたことが現実になる予感。直感を信じて進んで。"},
    {"rank": "大吉", "score": 90, "message": "絶好調な一日。周囲からのサポートも期待でき、新たな一歩を踏み出すのに最適な日です。自信を持って！"},
    {"rank": "吉", "score": 80, "message": "安定した好運気。普段通りの努力が実を結びやすい日です。身近な人への感謝を忘れずに。"},
    {"rank": "中吉", "score": 75, "message": "穏やかで心地よい一日になりそう。自分の趣味や、好きなことに時間を費やすと運気がさらにアップします。"},
    {"rank": "小吉", "score": 65, "message": "小さな幸せがたくさん見つかる日。焦らず、一歩ずつ進むことで安定した一日を過ごせます。"},
    {"rank": "末吉", "score": 55, "message": "現状維持が吉。無理に新しいことを始めるより、これまでの振り返りや整理整頓をするのがおすすめ。"},
    {"rank": "吉凶半々", "score": 50, "message": "波のある一日。午前中は少し停滞気味でも、午後から調子が上がってきます。リラックスを心がけて。"},
]

LUCKY_ITEMS = [
    "お気に入りの本", "カラフルな文房具", "お香・アロマキャンドル", "ミニ観葉植物", 
    "温かい紅茶", "新しいスニーカー", "革のパスケース", "スマートウォッチ", 
    "手作りのキーホルダー", "ハンカチ", "お気に入りのマグカップ", "ミントタブレット",
    "折りたたみ傘", "ノイズキャンセリングイヤホン", "ワイヤレス充電器"
]

LUCKY_COLORS = [
    {"name": "スターライトゴールド", "code": "#ffd700"},
    {"name": "ディープコズミックブルー", "code": "#1e3a8a"},
    {"name": "サクラピンク", "code": "#ffb7c5"},
    {"name": "エメラルドグリーン", "code": "#10b981"},
    {"name": "ラベンダーパープル", "code": "#a78bfa"},
    {"name": "サンセットオレンジ", "code": "#f97316"},
    {"name": "ピュアクリスタルホワイト", "code": "#f8fafc"},
    {"name": "ミントターコイズ", "code": "#2dd4bf"},
    {"name": "ルビーレッド", "code": "#ef4444"},
    {"name": "チャコールグレー", "code": "#4b5563"}
]

ZODIAC_SIGNS = [
    "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座",
    "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"
]

# Generate stable random numbers based on a string seed
def get_seeded_random(seed_str):
    sha = hashlib.sha256(seed_str.encode('utf-8')).hexdigest()
    # Use part of the hash as a seed
    return random.Random(int(sha[:16], 16))

@app.route('/')
def index():
    return render_template('index.html', zodiac_signs=ZODIAC_SIGNS)

@app.route('/api/fortune', methods=['POST'])
def get_fortune():
    data = request.json or {}
    name = data.get('name', '').strip()
    zodiac = data.get('zodiac', '').strip()
    
    if not name or not zodiac:
        return jsonify({"error": "名前と星座を入力してください。"}), 400

    if zodiac not in ZODIAC_SIGNS:
        return jsonify({"error": "無効な星座です。"}), 400

    # Create a unique seed for today, this zodiac sign, and this user name
    today_str = datetime.date.today().strftime('%Y-%m-%d')
    seed_str = f"{today_str}-{zodiac}-{name}"
    
    rng = get_seeded_random(seed_str)
    
    # Pick fortune
    fortune_choice = rng.choice(FORTUNES)
    
    # Generate random scores for categories
    love_score = rng.randint(60, 100) if fortune_choice['score'] >= 75 else rng.randint(40, 75)
    work_score = rng.randint(60, 100) if fortune_choice['score'] >= 75 else rng.randint(40, 75)
    money_score = rng.randint(60, 100) if fortune_choice['score'] >= 75 else rng.randint(40, 75)
    health_score = rng.randint(60, 100) if fortune_choice['score'] >= 75 else rng.randint(40, 75)
    
    lucky_item = rng.choice(LUCKY_ITEMS)
    lucky_color = rng.choice(LUCKY_COLORS)
    
    return jsonify({
        "date": today_str,
        "name": name,
        "zodiac": zodiac,
        "rank": fortune_choice['rank'],
        "score": fortune_choice['score'],
        "message": fortune_choice['message'],
        "love": love_score,
        "work": work_score,
        "money": money_score,
        "health": health_score,
        "lucky_item": lucky_item,
        "lucky_color": lucky_color
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
