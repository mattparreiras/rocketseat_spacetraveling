import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import Link from 'next/link';
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
export default function Home(props: HomeProps) {
  const { postsPagination } = props;

  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);
  const [posts, setPost] = useState<Post[]>(postsPagination.results);

  const loadMorePost = (): void => {
    if (nextPage)
      fetch(nextPage)
        .then(response => response.json())
        .then(data => {
          setNextPage(data.next_page);
          const newPosts = data.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              ),
              data: {
                title: RichText.asText(post.data.title),
                subtitle: RichText.asText(post.data.subtitle),
                author: RichText.asText(post.data.author),
              },
            };
          });
          setPost([...posts, ...newPosts]);
        });
  };

  return (
    <div className={commonStyles.container}>
      <img src="/images/logo.svg" alt="logo" className={styles.logo} />
      {posts.map(post => (
        <div key={post.uid} className={styles.postItem}>
          <Link href={`/post/${post.uid}`}>
            <a>{post.data.title}</a>
          </Link>
          <span>{post.data.subtitle}</span>
          <div>
            <time>
              <FiCalendar /> {post.first_publication_date}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
          </div>
        </div>
      ))}
      {nextPage ? (
        <button
          type="button"
          onClick={() => loadMorePost()}
          className={styles.loadMore}
        >
          Carregar mais posts
        </button>
      ) : (
        ''
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
