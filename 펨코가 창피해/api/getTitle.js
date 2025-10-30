// HTML 분석을 위한 cheerio 라이브러리를 가져옵니다.
const cheerio = require('cheerio');

// Vercel이 확실하게 인식할 수 있는 구형 문법(CommonJS)으로 수정합니다.
module.exports = async (request, response) => {
  // 프론트엔드에서 보낸 url 파라미터를 가져옵니다.
  const { url } = request.query;

  // URL이 전달되지 않았으면 에러를 반환합니다.
  if (!url) {
    return response.status(400).json({ error: 'URL is required' });
  }

  try {
    // 서버에서 직접 대상 URL로 접속합니다.
    const targetResponse = await fetch(url, {
      headers: {
        // 실제 브라우저인 것처럼 위장하는 헤더를 추가합니다.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      }
    });

    if (!targetResponse.ok) {
      throw new Error(`Failed to fetch page: ${targetResponse.statusText}`);
    }

    const htmlText = await targetResponse.text();
    const $ = cheerio.load(htmlText);

    // meta 태그의 'og:title' 속성 값이나 <title> 태그의 텍스트를 찾습니다.
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();

    if (!title) {
      throw new Error('Could not find a title on the page.');
    }
    
    // 성공적으로 찾은 제목을 JSON 형태로 프론트엔드에 보내줍니다.
    response.status(200).json({ title: title });

  } catch (error) {
    console.error(error);
    // 에러가 발생하면 에러 메시지를 JSON 형태로 보내줍니다.
    response.status(500).json({ error: error.message });
  }
};
