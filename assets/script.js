jQuery(document).ready(function ($) {
    const container = $('#github-projects');
    const user = container.data('user');
    const limit = parseInt(container.data('limit'), 10);
    const showUserInfo = container.data('show-user-info') === 'yes';

    const cacheDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = new Date().getTime();

    const profileKey = `github_profile_${user}`;
    const reposKey = `github_repos_${user}`;

    let profileData = null;
    let repoData = null;

    // Helper: Load from cache
    function loadFromCache(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        if (now - parsed.timestamp > cacheDuration) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    }

    // Helper: Save to cache
    function saveToCache(key, data) {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: now
        }));
    }

    // Helper: Display profile info
    function renderProfile(profile) {
        const createdDate = new Date(profile.created_at).toLocaleDateString();

        let extraLinks = '';
        if (profile.blog) {
            extraLinks += `<p><a href="${profile.blog}" target="_blank">🔗 Website</a></p>`;
        }
        if (profile.twitter_username) {
            extraLinks += `<p><a href="https://twitter.com/${profile.twitter_username}" target="_blank">🐦 @${profile.twitter_username}</a></p>`;
        }

        const userInfo = $(`
            <div class="github-user-info">
                <img src="${profile.avatar_url}" alt="${profile.login}" class="avatar">
                <div class="info">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:6px;">
                            <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.4 7.862 10.942.574.1.784-.25.784-.554v-2.15c-3.194.694-3.868-1.538-3.868-1.538-.523-1.33-1.278-1.684-1.278-1.684-1.046-.716.08-.7.08-.7 1.158.08 1.767 1.188 1.767 1.188 1.03 1.766 2.706 1.256 3.364.96.106-.744.404-1.26.736-1.55-2.55-.29-5.236-1.274-5.236-5.672 0-1.252.446-2.276 1.176-3.078-.118-.29-.51-1.456.112-3.036 0 0 .96-.308 3.14 1.174a10.959 10.959 0 0 1 5.72 0c2.18-1.482 3.14-1.174 3.14-1.174.624 1.58.232 2.746.114 3.036.732.802 1.174 1.826 1.174 3.078 0 4.41-2.692 5.378-5.254 5.662.414.356.78 1.06.78 2.134v3.162c0 .308.206.662.79.55C20.712 21.392 24 17.082 24 12c0-6.352-5.148-11.5-12-11.5z"/>
                        </svg>
                        ${profile.name || profile.login} <span class="handle">@${profile.login}</span>
                    </h2>
                    <p>${profile.bio || ''}</p>
                    <p class="location">${profile.location || ''} ${profile.company ? '| 🏢 ' + profile.company : ''}</p>
                    <p class="stats">
                        📦 ${profile.public_repos} Repos &nbsp;&nbsp; 👥 ${profile.followers} Followers &nbsp;&nbsp; ➕ ${profile.following} Following
                    </p>
                    <p class="join-date">🕐 Member since: ${createdDate}</p>
                    ${extraLinks}
                    <a class="profile-link" href="${profile.html_url}" target="_blank">View GitHub Profile</a>
                </div>
            </div>
        `);
        container.before(userInfo);
    }

    // Helper: Render repos
    function renderRepos(repos) {
        container.empty();
        const projects = repos.slice(0, limit);

        $.each(projects, function (i, repo) {
            const repoCard = $(`
                <div class="github-repo-card">
                    <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                    <p>${repo.description || 'No description'}</p>
                    <div class="meta">
                        <span>★ ${repo.stargazers_count}</span>
                        <span>⏱️ Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `);
            container.append(repoCard);
        });
    }

    // Load from localStorage
    profileData = loadFromCache(profileKey);
    repoData = loadFromCache(reposKey);

    // Fetch from API if not cached
    if (!profileData || !repoData) {
        if (showUserInfo) {
            $.getJSON(`https://api.github.com/users/${user}`, function (data) {
                saveToCache(profileKey, data);
                renderProfile(data);
            });
        }

        $.getJSON(`https://api.github.com/users/${user}/repos?sort=updated`, function (data) {
            saveToCache(reposKey, data);
            renderRepos(data);
        });
    } else {
        if (showUserInfo) {
            renderProfile(profileData);
        }
        renderRepos(repoData);
    }
});
