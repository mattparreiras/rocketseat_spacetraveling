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

  const timeToRead = useMemo(() => {
    const wordCount = post.data.content.reduce((total, contentItem) => {
      total += contentItem.heading.split(' ').length;

      const words = contentItem.body.map(
        section => section.text.split(' ').length
      );
      words.forEach(word => {
        total += word;
      });

      return total;
    }, 0);
    return Math.ceil(wordCount / 200);
  }, [post]);

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
          <div className={styles.postInfo}>
            <time>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'PP', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {timeToRead} min
            </span>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(section => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                />
              </section>
            ))}
          </div>
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

  const content = response.data.content.map(section => {
    return {
      heading:
        typeof section.heading === 'string'
          ? section.heading
          : RichText.asText(section.heading),
      body: [...section.body],
    };
  });

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title:
        typeof response.data.title === 'string'
          ? response.data.title
          : RichText.asText(response.data.title),
      subtitle:
        typeof response.data.subtitle === 'string'
          ? response.data.subtitle
          : RichText.asText(response.data.subtitle),
      banner: {
        url: response.data.banner.url ?? null,
      },
      author:
        typeof response.data.author === 'string'
          ? response.data.author
          : RichText.asText(response.data.author),
      content,
    },
  };

  return {
    props: { post },
  };
};
