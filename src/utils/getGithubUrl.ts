export function getGitHubUrl(from: string = '/') {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
        client_id: import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID as string,
        redirect_uri: import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URL as string,
        scope: 'user:email',
        state: from,  
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
}


export function getYandexUrl(from: string = '/dashboard') {
  const rootUrl = 'https://oauth.yandex.ru/authorize';
  const options = {
    response_type: 'code',
    client_id: import.meta.env.VITE_YANDEX_OAUTH_CLIENT_ID as string,
    redirect_uri: import.meta.env.VITE_YANDEX_OAUTH_REDIRECT_URL as string,
    scope: 'login:email login:info login:avatar',
    state: from, 
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}