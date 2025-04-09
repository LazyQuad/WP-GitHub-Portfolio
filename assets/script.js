jQuery(document).ready(function ($) {
    const container = $('#github-projects');
    const user = container.data('user');
    const limit = parseInt(container.data('limit'), 10);
    let mode = container.data('mode') || 'vertical';
    let sortType = container.data('sort') || 'updated';
    const pinnedRepos = (container.data('pinned') || '').split(',').map(r => r.trim()).filter(Boolean);

    function getViewMode() {
        return mode === 'list' ? 'list' : 'card';
    }

    function getLayoutMode() {
        return mode === 'horizontal' ? 'horizontal' : 'vertical';
    }

    function renderHeader(profile) {
        const headerHtml = `
            <div class="github-header">
                <div class="github-header-left">
                    <a href="https://github.com/${profile.login}" target="_blank" class="github-header-link">
                        <img src="${wpghp_vars.assets_url}github-mark.png" alt="GitHub" class="github-icon" />
                        <span>${profile.login}</span>
                        <span>📦 ${profile.public_repos} Repositories</span>
                        <span>👥 ${profile.followers} Followers</span>
                        <span>🤝 ${profile.following} Following</span>
                    </a>
                </div>
                <div class="github-controls">
                    <select class="view-dropdown">
                        <option value="vertical" ${mode === 'vertical' ? 'selected' : ''}>Vertical</option>
                        <option value="horizontal" ${mode === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                        <option value="list" ${mode === 'list' ? 'selected' : ''}>List</option>
                    </select>
                    <select class="sort-dropdown">
                        <option value="updated" ${sortType === 'updated' ? 'selected' : ''}>Updated</option>
                        <option value="stars" ${sortType === 'stars' ? 'selected' : ''}>Stars</option>
                        <option value="name" ${sortType === 'name' ? 'selected' : ''}>Name</option>
                    </select>
                </div>
            </div>`;

        container.before(headerHtml);

        $('.view-dropdown, .sort-dropdown').on('change', function () {
            mode = $('.view-dropdown').val();
            sortType = $('.sort-dropdown').val();
            function init() {
                container.html('<div class="loader"></div>');
                $.get(`https://api.github.com/users/${user}`, function (profile) {
                    container.empty();
                    container.removeClass().addClass('github-portfolio ' + getViewMode() + '-view ' + getLayoutMode());
                    renderHeader(profile);
                    fetchGitHubRepos();
                });
            }
            container.empty();
            fetchGitHubRepos();
        });
    }

    function renderRepo(repo, isPinned = false) {
        const updated = new Date(repo.updated_at).toLocaleDateString();
        const topics = (repo.topics || []).map(t => `<span class="repo-topic">#${t}</span>`).join(' ');
        const meta = `<div class="meta">
            ⭐ ${repo.stargazers_count}
            ${repo.language ? `🧑‍💻 ${repo.language}` : ''}
            🕒 ${updated}
        </div>`;

        const html = getViewMode() === 'card' ? `
            <div class="github-repo-card${isPinned ? ' pinned' : ''}">
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'No description'}</p>
                ${topics}
                ${meta}
            </div>
        ` : `
            <div class="github-repo-list-item">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                <span>${repo.description || 'No description'}</span>
                ${meta}
            </div>
        `;

        container.append(html);
    }

    function fetchGitHubRepos() {
        container.html('<div class="loader"></div>');
        $.get(`https://api.github.com/users/${user}/repos?per_page=100`, function (repos) {
            container.empty();

            if (!Array.isArray(repos)) {
                container.append(`<p class="no-repos">Error loading repositories.</p>`);
                return;
            }

            if (sortType === 'stars') {
                repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            } else if (sortType === 'name') {
                repos.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            }

            const pinned = repos.filter(r => pinnedRepos.includes(r.name));
            const unpinned = repos.filter(r => !pinnedRepos.includes(r.name));

            pinned.slice(0, limit).forEach(repo => renderRepo(repo, true));
            unpinned.slice(0, limit - pinned.length).forEach(repo => renderRepo(repo));
        });
    }

    function init() {
        container.html('<div class="loader"></div>');
        $.get(`https://api.github.com/users/${user}`, function (profile) {
            container.empty();
            renderHeader(profile);
            fetchGitHubRepos();
        });
    }

    init();
});