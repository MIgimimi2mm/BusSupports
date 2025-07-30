import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import bustimesData from '../bustime.json';
import styles from '../styles/Home.module.css';
import holidayJp from 'japanese-holidays';

// Determine if today is a weekend (Saturday/Sunday)
const isItWeekend = () => {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// Determine if today is a Japanese national holiday
const isItHoliday = () => {
  const currentDate = new Date();
  return holidayJp.isHoliday(currentDate);
};

/**
 * Choose a background colour based on the bus route.  Colour coding
 * helps users differentiate services at a glance.  New routes
 * default to a muted tone so they still render legibly even if no
 * specific colour mapping exists.
 *
 * @param {string} route - The bus route identifier (e.g. "55A").
 * @returns {string} A hex colour string for use as a CSS background.
 */
const getRouteColor = (route) => {
  const routeColorMap = {
    '55A': '#0070f3',       // blue
    '55C': '#B22222',       // firebrick
    '55F': '#FFA500',       // orange
    '55G': '#228B22',       // forest green
    '55H': '#8B008B',       // dark magenta
    '50' : '#8B4513',       // saddle brown
  };
  return routeColorMap[route] || '#444444';
};

/**
 * Sort the appropriate bustimes array (weekday or holiday) in ascending
 * order.  Sorting by hour then by minute ensures the times appear
 * chronologically.
 */
const sortBustimes = () => {
  const todaybustime = (isItWeekend() || isItHoliday())
    ? bustimesData.BustimesHoliday
    : bustimesData.BustimesWeekday;
  return [...todaybustime].sort((a, b) => {
    if (a.hour !== b.hour) {
      return a.hour - b.hour;
    }
    return a.minute - b.minute;
  });
};

export default function Home() {
  const [nextBuses, setNextBuses] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);

  // Update the clock and upcoming buses every second
  useEffect(() => {
    const updateInfo = () => {
      const now = new Date();
      setCurrentTime(now);

      // Filter upcoming buses based on current time
      const allBustimes = sortBustimes();
      const upcomingBuses = [];
      for (const bus of allBustimes) {
        if (
          bus.hour > now.getHours() ||
          (bus.hour === now.getHours() && bus.minute > now.getMinutes())
        ) {
          upcomingBuses.push(bus);
        }
      }
      setNextBuses(upcomingBuses);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle the detail panel for a bus entry
  const togglePanel = (index) => {
    setOpenPanel(openPanel === index ? null : index);
  };

  const isWeekendOrHoliday = isItWeekend() || isItHoliday();

  return (
    <div className={styles.container}>
      <Head>
        <title>はこだて未来大バス停情報</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.headerTitle}>はこだて未来大バス停情報</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>現在の時刻</h2>
          {/* currentTime may be null during first render */}
          <p className={styles.currentTime}>{currentTime ? currentTime.toLocaleTimeString() : ''}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{isWeekendOrHoliday ? '休日ダイヤ' : '平日ダイヤ'}</h2>
        </section>

        <section className={styles.busListSection}>
          {nextBuses.length > 0 ? (
            nextBuses.map((bus, index) => (
              <div
                key={`${bus.route}-${bus.hour}-${bus.minute}-${index}`}
                className={styles.busCard}
                onClick={() => togglePanel(index)}
              >
                <div className={styles.busRow}>
                  <span
                    className={styles.routeBadge}
                    style={{ backgroundColor: getRouteColor(bus.route) }}
                  >
                    {bus.route}
                  </span>
                  <span className={styles.destination}>{bus.destination}</span>
                  <span className={styles.time}>{`${String(bus.hour).padStart(2, '0')}:${String(bus.minute).padStart(2, '0')}`}</span>
                </div>
                {openPanel === index && (
                  <div className={styles.status}>定刻通り</div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noBusMessage}>今日のバスの時刻はすべて終了しました。</p>
          )}
        </section>
      </main>
    </div>
  );
}
