export default function handleAxiosError(e, response) {
    if (response.status >= 400) {
      let errorMessage = `HTTP Error: ${response.status}\nError Message: ${response.statusText}`;
      if (response.data && response.data.error) {
        errorMessage += `\nServer Error: ${response.data.error}`;
      }
      let solutionMessage = '';
      if (response.status === 400) {
        solutionMessage = '请求参数错误，请检查请求参数是否符合要求。';
      } else if (response.status === 401) {
        solutionMessage = '未经授权，请提供有效的身份验证信息。';
      } else if (response.status === 403) {
        solutionMessage = '访问被拒绝，请确保有足够的权限。';
      } else if (response.status === 404) {
        solutionMessage = '资源未找到，请检查请求的URL是否正确。';
      } else if (response.status === 429) {
        solutionMessage = '请求过于频繁，请稍后重试。';
      } else if (response.status === 500) {
        solutionMessage = '服务器发生错误，请稍后重试。';
      } else {
        solutionMessage = '发生未知错误，请联系网站管理员。';
      }
      let errorResponse = `${errorMessage}\n${solutionMessage}`;
      e.reply(errorResponse);
    } else if (response instanceof Error) {
      let errorMessage = `Axios Error: ${response.message}`;
      e.reply(errorMessage);
    } else {
      let errorMessage = `Unknown Error: ${response}`;
      e.reply(errorMessage);
    }
  }