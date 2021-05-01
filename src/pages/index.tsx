import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home() {
  return (
    <div className={commonStyles.container}>
      <img src="/images/logo.svg" alt="logo" className={styles.logo} />
      <div className={styles.postItem}>
        <a>Título do Post</a>
        <span>Subtítulo do Post</span>
        <div>
          <time>
            <FiCalendar /> Data de publicação
          </time>
          <span>
            <FiUser /> Autor name
          </span>
        </div>
      </div>
      <div className={styles.postItem}>
        <a>Título do Post</a>
        <span>Subtítulo do Post</span>
        <div>
          <time>
            <FiCalendar /> Data de publicação
          </time>
          <span>
            <FiUser /> Autor name
          </span>
        </div>
      </div>
      <div className={styles.postItem}>
        <a>Título do Post</a>
        <span>Subtítulo do Post</span>
        <div>
          <time>
            <FiCalendar /> Data de publicação
          </time>
          <span>
            <FiUser /> Autor name
          </span>
        </div>
      </div>
      <a className={styles.loadMore}>Carregar mais Post</a>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
