import sys
import json
sys.path.append('./backend')
import services

r1 = services.get_feedback_stats('Red Velvet', 'All')
r2 = services.get_feedback_stats('Red Velvet', 'Hà Nội')
r3 = services.get_feedback_stats('Red Velvet', 'TP. Hồ Chí Minh')

print(json.dumps({'All': r1, 'Hanoi': r2, 'HCM': r3}, ensure_ascii=False))
