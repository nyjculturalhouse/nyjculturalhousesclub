/**
 * theme.js
 * 모든 페이지가 공유하는 Tailwind 색상 테마입니다.
 * ⚠️ 색상 값은 기존 시스템 그대로 유지합니다. 값을 바꾸면 전 페이지 색상이 함께 바뀝니다.
 *   primary : #0B50D0 (hover #083E9E) — 매거진 스타일의 깊은 다크 차콜
 *   accent  : #0B50D0 (hover #083E9E) — 힙한 오렌지 레드 포인트
 *   bg      : #F4F5F6               — 미색이 도는 부드러운 화이트 배경
 *   surface : #ffffff
 *   outline : #D7DCE1
 */
window.KRDS_TAILWIND_THEME = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0B50D0",
                    hover: "#083E9E"
                },
                accent: {
                    bg: "#0B50D0",
                    text: "#FFFFFF",
                    hover: "#083E9E"
                },
                bg: "#F4F5F6",
                surface: "#ffffff",
                outline: "#D7DCE1"
            },
            boxShadow: {
                soft: "0 8px 30px rgba(0,0,0,0.03)",
                modal: "0 20px 50px rgba(0, 0, 0, 0.15)"
            }
        }
    }
};

if (window.tailwind) {
    window.tailwind.config = window.KRDS_TAILWIND_THEME;
}
