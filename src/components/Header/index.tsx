/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Header() {
  return (
    <div className={commonStyles.container}>
      <Link href="/">
        <img className={styles.logo} alt="logo" src="/images/logo.svg" />
      </Link>
    </div>
  );
}
