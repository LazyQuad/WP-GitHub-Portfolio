jQuery(document).ready(function ($) {
    const container = $('#github-projects');
    const user = container.data('user');
    const limit = parseInt(container.data('limit'), 10);
    const showUserInfo = container.data('show-user-info') === 'yes';

    if (!user) {
        container.html('<p>GitHub username is missing.</p>');
        return;
    }

    // Fetch user profile info (if enabled)
    if (showUserInfo) {
        $.getJSON(`https://api.github.com/users/${user}`, function (profile) {
            const userInfo = $(`
                <div class="github-user-info">
                    <img src="${profile.avatar_url}" alt="${profile.login}" class="avatar">
                    <div class="info">
                        <h2>${profile.name || profile.login}</h2>
                        <p>${profile.bio || ''}</p>
                        <p class="location">${profile.location || ''}</p>
                        <a href="${profile.html_url}" target="_blank">View GitHub Profile</a>
                    </div>
                </div>
            `);
            container.before(userInfo);
        });
    }

    // Fetch repositories
    $.getJSON(`https://api.github.com/users/${user}/repos?sort=updated`, function (data) {
        container.empty();

        if (!data.length) {
            container.html('<p>No repositories found.</p>');
            return;
        }

        const projects = data.slice(0, limit);

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
    }).fail(function () {
        container.html('<p>Error loading GitHub projects. Please try again later.</p>');
    });
});
