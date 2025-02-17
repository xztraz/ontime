import QRCode from 'react-qr-code';
import style from './Public.module.css';
import Paginator from 'common/components/views/Paginator';
import NavLogo from 'common/components/nav/NavLogo';
import { AnimatePresence, motion } from 'framer-motion';
import TitleSide from 'common/components/views/TitleSide';
import { useEffect } from 'react';

export default function Public(props) {
  const { publ, publicTitle, time, events, publicSelectedId, general } = props;

  // Set window title
  useEffect(() => {
    document.title = 'ontime - Public Screen';
  }, []);

  // Format messages
  const showPubl = publ.text !== '' && publ.visible;

  // motion
  const titleVariants = {
    hidden: {
      x: -1500,
    },
    visible: {
      x: 0,
      transition: {
        duration: 1,
      },
    },
    exit: {
      x: -1500,
    },
  };
  return (
    <div className={style.container__gray}>
      <NavLogo />

      <div className={style.eventTitle}>{general.title}</div>

      <AnimatePresence>
        {publicTitle.showNow && (
          <motion.div
            className={style.nowContainer}
            key='now'
            variants={titleVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <TitleSide
              label='Now'
              type='now'
              title={publicTitle.titleNow}
              subtitle={publicTitle.subtitleNow}
              presenter={publicTitle.presenterNow}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {publicTitle.showNext && (
          <motion.div
            className={style.nextContainer}
            key='next'
            variants={titleVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <TitleSide
              label='Next'
              type='next'
              title={publicTitle.titleNext}
              subtitle={publicTitle.subtitleNext}
              presenter={publicTitle.presenterNext}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={style.todayContainer}>
        <div className={style.label}>Today</div>
        <div className={style.entriesContainer}>
          <Paginator selectedId={publicSelectedId} events={events} />
        </div>
      </div>

      <div
        className={
          showPubl ? style.publicContainer : style.publicContainerHidden
        }
      >
        <div className={style.label}>Public message</div>
        <div className={style.message}>{publ.text}</div>
      </div>

      <div className={style.clockContainer}>
        <div className={style.label}>Time Now</div>
        <div className={style.clock}>{time.clock}</div>
      </div>

      <div className={style.infoContainer}>
        <div className={style.label}>Info</div>
        <div className={style.infoMessages}>
          <div className={style.info}>{general.publicInfo}</div>
        </div>
        <div className={style.qr}>
          {general.url != null && general.url !== '' && (
            <QRCode
              value={general.url}
              size={window.innerWidth / 12}
              level='L'
            />
          )}
        </div>
      </div>
    </div>
  );
}
