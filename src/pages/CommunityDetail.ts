//this is where we would write the frontend for communities
// ---- would also need to use sql-related variables to load in communities (likely through a map)
import { html, css, type TemplateResult } from "lit";
import '../components/SearchBar.js';
import '../components/CommunityCard.js';
import '../components/CommunityContainer.js';
import '../components/JoinButton.js';

interface ComProps {
    currentPath?: string;
}

// export const CommunityDetailPage = ({ currentPath = '/community-detail' }: ComProps): TemplateResult => {
//     const styles = css`
//         :host {
//             display: block;
//         }
//         div.banner {
//             background-color: var(--color-5);
//             margin: 24px;
//             text-align: center;
//             color: white;
//             width: fit-content;
//             justify-self: center;
//         }

//         button {
//             background-color: var(--color-5);
//             border-radius: 8px;
//             color: white;
//         }
//         div.content {
//             justify-self: center;
//         }
//         div.my-communities, div.popular-communities {
//             margin: 24px;
//             gap: 24px;
//         }
//     `

//     return html`
//         <style>${styles}</style>
//         <div class="banner">
//              <img src="https://www.baltimoremagazine.com/wp-content/uploads/2026/02/wuthering-heights-header-1-1200x675.jpg">
//         </div>

//         <div class="content">
//             <div class="popular-communities">
//                 <h3>Movie Adaptations</h3>
//                 <label>2.4k Members</label>
//                 <join-button></join-button>
//             </div>

//         </div>
//     `;
// };
export const CommunityDetailPage = (): TemplateResult => {
  const community = {
    name: "Movie Adaptations",
    members: "2.4k members",
    description: "A book club for readers who love comparing books with their screen adaptations.",
    banner:
      "https://www.baltimoremagazine.com/wp-content/uploads/2026/02/wuthering-heights-header-1-1200x675.jpg",
    currentBook: {
      title: "Wuthering Heights",
      author: "Emily Brontë",
    },
    meetings: [
      { title: "Chapter 1 Discussion", date: "Mon, Apr 6" },
      { title: "Chapter 2 Discussion", date: "Mon, Apr 13" },
    ],
    discussions: [
      "Chapter 1 Discussion",
      "Chapter 2 Discussion",
      "General Chat",
    ],
  };

  return html`
    <main class="community-detail">
      <section class="hero">
        <img src=${community.banner} alt="${community.name} banner" />
        <div class="hero__content">
          <h1>${community.name}</h1>
          <p>${community.members}</p>
          <p>${community.description}</p>
          <join-button></join-button>
        </div>
      </section>

      <section class="current-read">
        <h2>Currently Reading</h2>
        <p>${community.currentBook.title} by ${community.currentBook.author}</p>
      </section>

      <section class="meetings">
        <h2>Upcoming Meetings</h2>
        ${community.meetings.map(
          (meeting) => html`
            <article class="meeting-card">
              <h3>${meeting.title}</h3>
              <p>${meeting.date}</p>
              <button>Join</button>
            </article>
          `
        )}
      </section>

      <section class="discussions">
        <h2>Discussions</h2>
        ${community.discussions.map(
          (name) => html`<button class="discussion-row">${name}</button>`
        )}
      </section>
    </main>
  `;
};

export default CommunityDetailPage;