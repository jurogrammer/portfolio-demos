# Website Builder

에센스 기반 웹사이트 생성 도구.

## 사용법

### 1. 에센스 추출
```
/capture-essence https://example.com
```

### 2. 사이트 생성
```
/build-site <essence-slug> <project-slug> --format html "요구사항"
```

## 구조

- `essences/` — 추출된 디자인 에센스 저장소
- `projects/` — 생성된 웹사이트 프로젝트
