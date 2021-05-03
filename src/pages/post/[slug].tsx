import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { ReactElement, useMemo } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps): ReactElement {
  const { post } = props;

  const router = useRouter();

  const timeToRead = 0; // useMemo(() => {
  //   let wordCount = 0;
  //   if (post) {
  //     post.data.content.forEach(section => {
  //       wordCount += section.heading.split(' ').length;
  //       wordCount += section.body.text.split(' ').length;
  //     });
  //   }
  //   return Math.ceil(wordCount / 200);
  // }, [post]);

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <img
        className={styles.banner}
        alt={post.data.title}
        src={post.data.banner.url}
      />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <FiCalendar /> {post.first_publication_date}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {timeToRead}min
            </span>
          </div>
          {post.data.content.map((section, index) => (
            <section
              // eslint-disable-next-line react/no-array-index-key
              key={index + section.heading}
              className={styles.postContent}
            >
              <h2>{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: section.body.text }} />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [],
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;

  const response = await prismic.getByUID('post', String(slug), {});

  const content = response.data.content.map(section => ({
    heading: RichText.asText(section.heading),
    body: {
      text: RichText.asHtml(section.body),
    },
  }));

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content,
    },
  };

  return {
    props: { post },
  };
};
