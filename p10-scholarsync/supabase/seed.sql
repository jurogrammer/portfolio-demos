-- ScholarSync KR — Sample Scholarship Data (20건)

INSERT INTO ss_scholarships (name, organization, org_type, target_degree, min_gpa, max_income_quintile, target_regions, target_majors, amount_type, amount_value, deadline, application_start, essay_prompts, source_url, is_active, extra_requirements) VALUES

('국가장학금 I유형 (2026년 2학기)', '한국장학재단', 'government', '{undergraduate}', 0, 8, NULL, NULL, 'variable', NULL, '2026-08-31', '2026-06-01',
 '[{"prompt":"대학 생활 중 가장 의미 있었던 경험과 이를 통해 성장한 점을 서술하세요.","max_chars":1500}]',
 'https://www.kosaf.go.kr', true, '소득분위 기준 차등 지급'),

('국가장학금 II유형 (2026년 2학기)', '한국장학재단', 'government', '{undergraduate}', 2.0, 9, NULL, NULL, 'variable', NULL, '2026-08-31', '2026-06-01',
 '[{"prompt":"본인의 학업 계획과 장학금이 필요한 이유를 구체적으로 작성하세요.","max_chars":1500}]',
 'https://www.kosaf.go.kr', true, '대학별 자체 선발 기준 적용'),

('푸른등대 기부장학금', '한국장학재단', 'government', '{undergraduate,master}', 3.0, 6, NULL, NULL, 'fixed', 5000000, '2026-07-15', '2026-05-01',
 '[{"prompt":"본인의 성장 과정과 미래 비전을 기술하세요.","max_chars":2000},{"prompt":"장학금 수혜 후 사회에 어떻게 기여할 것인지 서술하세요.","max_chars":1000}]',
 'https://www.kosaf.go.kr', true, NULL),

('관정이종환 장학재단 장학금', '관정이종환교육재단', 'foundation', '{undergraduate,master,doctorate}', 3.5, NULL, NULL, NULL, 'full_tuition', NULL, '2026-06-30', '2026-04-01',
 '[{"prompt":"학문적 관심 분야와 연구 계획을 서술하세요.","max_chars":2000},{"prompt":"리더십 경험과 공동체 기여 활동을 기술하세요.","max_chars":1500},{"prompt":"장학생으로서의 각오와 졸업 후 계획을 밝히세요.","max_chars":1000}]',
 'https://www.ikef.or.kr', true, '서류 심사 + 면접'),

('아산 사회봉사 장학금', '아산나눔재단', 'foundation', '{undergraduate}', 3.0, 4, NULL, NULL, 'fixed', 5000000, '2026-07-31', '2026-05-15',
 '[{"prompt":"봉사활동 경험과 이를 통해 배운 점을 서술하세요.","max_chars":1500},{"prompt":"향후 사회 기여 계획을 작성하세요.","max_chars":1000}]',
 'https://www.asan-nanum.org', true, '봉사활동 100시간 이상'),

('일주학술문화재단 장학금', '일주학술문화재단', 'foundation', '{undergraduate,master}', 3.5, 5, NULL, NULL, 'half_tuition', NULL, '2026-06-15', '2026-04-15',
 '[{"prompt":"본인의 학업 성과와 향후 학문적 목표를 기술하세요.","max_chars":2000}]',
 'https://www.iljufoundation.org', true, NULL),

('서울시 희망 장학금', '서울장학재단', 'local_gov', '{undergraduate}', 2.5, 5, '{서울}', NULL, 'fixed', 3000000, '2026-07-20', '2026-05-20',
 '[{"prompt":"서울에서의 대학 생활과 학업 목표를 서술하세요.","max_chars":1500}]',
 'https://www.seoulscholarship.kr', true, '서울 소재 대학 재학'),

('경기도 우수학생 장학금', '경기도교육청', 'local_gov', '{undergraduate}', 3.0, 6, '{경기}', NULL, 'fixed', 2000000, '2026-08-10', '2026-06-10',
 '[{"prompt":"학업 우수성을 보여주는 구체적인 사례와 앞으로의 학습 계획을 서술하세요.","max_chars":1500}]',
 'https://www.goe.go.kr', true, '경기도 거주 학생'),

('부산 인재 장학금', '부산인재평생교육진흥원', 'local_gov', '{undergraduate,master}', 3.0, 5, '{부산}', NULL, 'fixed', 2500000, '2026-07-25', '2026-05-25',
 '[{"prompt":"부산 지역 발전에 기여할 수 있는 본인의 역량과 계획을 서술하세요.","max_chars":1500}]',
 'https://www.bitle.kr', true, '부산 출신 또는 부산 소재 대학'),

('삼성꿈장학재단 대학 장학금', '삼성꿈장학재단', 'foundation', '{undergraduate}', 3.0, 3, NULL, NULL, 'full_tuition', NULL, '2026-06-20', '2026-04-01',
 '[{"prompt":"가정환경의 어려움을 극복한 경험과 이를 통해 얻은 교훈을 서술하세요.","max_chars":2000},{"prompt":"대학 졸업 후 사회에 기여하고자 하는 구체적인 계획을 작성하세요.","max_chars":1500}]',
 'https://www.sdream.or.kr', true, '기초생활수급자 우대'),

('이공계 우수인재 장학금', '한국과학창의재단', 'government', '{undergraduate,master,doctorate}', 3.5, NULL, NULL, '{공학,자연과학,IT,수학}', 'fixed', 6000000, '2026-07-10', '2026-05-10',
 '[{"prompt":"이공계 분야에서의 연구 관심사와 향후 계획을 서술하세요.","max_chars":2000},{"prompt":"과학기술이 사회에 미치는 영향에 대한 본인의 견해를 밝히세요.","max_chars":1000}]',
 'https://www.kofac.re.kr', true, '이공계 전공자 한정'),

('대한건설협회 장학금', '대한건설협회', 'foundation', '{undergraduate}', 3.0, 6, NULL, '{건축,토목,건설}', 'fixed', 3000000, '2026-08-15', '2026-06-15',
 '[{"prompt":"건설 분야에 대한 관심과 진로 계획을 서술하세요.","max_chars":1500}]',
 'https://www.cak.or.kr', true, '건설 관련 학과'),

('정수장학회 장학금', '정수장학회', 'foundation', '{undergraduate,master}', 3.5, 4, NULL, NULL, 'fixed', 4000000, '2026-06-25', '2026-04-25',
 '[{"prompt":"본인의 인생에서 가장 큰 도전과 그 결과를 서술하세요.","max_chars":1500},{"prompt":"장학생으로 선발된다면 어떤 변화를 만들고 싶은지 작성하세요.","max_chars":1000}]',
 'https://www.chungs.or.kr', true, NULL),

('대전 청년 희망 장학금', '대전광역시', 'local_gov', '{undergraduate}', 2.5, 6, '{대전}', NULL, 'fixed', 1500000, '2026-08-20', '2026-06-20',
 '[{"prompt":"대전 지역에서의 대학 생활과 지역 사회 참여 경험을 서술하세요.","max_chars":1500}]',
 'https://www.daejeon.go.kr', true, '대전 거주 또는 대전 소재 대학'),

('BK21 FOUR 대학원 혁신인재양성', '한국연구재단', 'government', '{master,doctorate}', 3.5, NULL, NULL, NULL, 'fixed', 9000000, '2026-09-01', '2026-07-01',
 '[{"prompt":"석/박사 과정 연구 계획과 기대 성과를 구체적으로 서술하세요.","max_chars":3000}]',
 'https://www.nrf.re.kr', true, 'BK21 참여 대학원'),

('인천 미래인재 장학금', '인천장학재단', 'local_gov', '{undergraduate}', 3.0, 5, '{인천}', NULL, 'fixed', 2000000, '2026-07-30', '2026-05-30',
 '[{"prompt":"인천 발전에 기여할 본인의 비전과 역량을 서술하세요.","max_chars":1500}]',
 'https://www.ischolar.or.kr', true, '인천 거주 학생'),

('국가근로장학금 (2026년 2학기)', '한국장학재단', 'government', '{undergraduate}', 0, 8, NULL, NULL, 'variable', NULL, '2026-08-25', '2026-06-25',
 NULL,
 'https://www.kosaf.go.kr', true, '교내/교외 근로 활동 참여'),

('롯데장학재단 대학 장학금', '롯데장학재단', 'foundation', '{undergraduate}', 3.0, 5, NULL, NULL, 'fixed', 5000000, '2026-07-05', '2026-05-05',
 '[{"prompt":"본인의 성장 배경과 대학에서의 학업 목표를 서술하세요.","max_chars":1500},{"prompt":"미래 사회에서 본인이 하고 싶은 역할을 구체적으로 작성하세요.","max_chars":1000}]',
 'https://www.lottefoundation.or.kr', true, NULL),

('광주 빛고을 인재 장학금', '광주광역시', 'local_gov', '{undergraduate,master}', 2.5, 6, '{광주}', NULL, 'fixed', 2000000, '2026-08-05', '2026-06-05',
 '[{"prompt":"광주 지역의 미래를 위해 기여하고 싶은 분야와 방법을 서술하세요.","max_chars":1500}]',
 'https://www.gwangju.go.kr', true, '광주 출신 또는 광주 소재 대학'),

('대통령과학장학금', '한국장학재단', 'government', '{undergraduate}', 3.8, NULL, NULL, '{자연과학,공학,IT}', 'full_tuition', NULL, '2026-06-10', '2026-03-01',
 '[{"prompt":"과학기술 분야에서의 연구 경험과 업적을 서술하세요.","max_chars":2000},{"prompt":"과학자로서의 장기 비전과 한국 과학 발전에 대한 기여 계획을 밝히세요.","max_chars":2000}]',
 'https://www.kosaf.go.kr', true, '이공계 최우수 학생, 추천서 필요')

ON CONFLICT DO NOTHING;
