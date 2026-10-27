const Movie = require('./models/Movie');
const Cinema = require('./models/Cinema');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

const seedInitialData = async () => {
  // Clear collections
  await Movie.deleteMany({});
  await Cinema.deleteMany({});
  await Showtime.deleteMany({});
  await Booking.deleteMany({});

  // 1. REAL MOVIES (HOLLYWOOD & BOLLYWOOD)
  const movies = await Movie.insertMany([
    // === HOLLYWOOD ===
    {
      title: 'Dune: Part Two',
      description:
        'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
      genre: ['Sci-Fi', 'Adventure', 'Drama', 'Action'],
      duration: 166,
      rating: 'UA',
      imdbRating: 8.5,
      votesCount: '480K+',
      category: 'hollywood',
      formats: ['IMAX 2D', '4DX', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2024-03-01'),
      posterUrl: '/posters/dune-2.jpg',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 1840,
    },
    {
      title: 'Deadpool & Wolverine',
      description:
        'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up with an even more reluctant Wolverine.',
      genre: ['Action', 'Comedy', 'Sci-Fi'],
      duration: 128,
      rating: 'A',
      imdbRating: 7.7,
      votesCount: '390K+',
      category: 'hollywood',
      formats: ['3D', 'IMAX 3D', '4DX', '2D'],
      releaseDate: new Date('2024-07-26'),
      posterUrl: '/posters/deadpool-wolverine.jpg',
      director: 'Shawn Levy',
      cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Morena Baccarin'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 2450,
    },
    {
      title: 'Oppenheimer',
      description:
        'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and geopolitical consequences that reshaped modern civilization.',
      genre: ['Biography', 'Drama', 'History'],
      duration: 180,
      rating: 'UA',
      imdbRating: 8.9,
      votesCount: '780K+',
      category: 'hollywood',
      formats: ['IMAX 70mm', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2023-07-21'),
      posterUrl: '/posters/oppenheimer.jpg',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 1560,
    },
    {
      title: 'Gladiator II',
      description:
        'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      genre: ['Action', 'Adventure', 'Drama'],
      duration: 148,
      rating: 'A',
      imdbRating: 7.1,
      votesCount: '190K+',
      category: 'hollywood',
      formats: ['IMAX 2D', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2024-11-22'),
      posterUrl: '/posters/gladiator-2.jpg',
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 1980,
    },
    {
      title: 'Interstellar (10th Anniversary IMAX)',
      description:
        'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers through a wormhole to find a new planet for humans.',
      genre: ['Adventure', 'Drama', 'Sci-Fi'],
      duration: 169,
      rating: 'UA',
      imdbRating: 8.7,
      votesCount: '2.1M+',
      category: 'hollywood',
      formats: ['IMAX 70mm', 'Laser 2D'],
      releaseDate: new Date('2014-11-07'),
      posterUrl: '/posters/interstellar.jpg',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 3200,
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      description:
        'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      genre: ['Animation', 'Action', 'Adventure'],
      duration: 140,
      rating: 'U',
      imdbRating: 8.6,
      votesCount: '410K+',
      category: 'hollywood',
      formats: ['4DX', '3D', '2D'],
      releaseDate: new Date('2023-06-02'),
      posterUrl: '/posters/spider-verse.jpg',
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      language: 'English',
      status: 'now_showing',
      liveViewers: 1350,
    },

    // === BOLLYWOOD ===
    {
      title: 'Stree 2: Sarkate Ka Aatank',
      description:
        'After the events of Stree, the town of Chanderi is being haunted again. This time, women are mysteriously abducted by a headless entity known as Sarkata. The town turns to Vicky and the gang along with the mysterious woman to save them once again.',
      genre: ['Comedy', 'Horror'],
      duration: 147,
      rating: 'UA',
      imdbRating: 7.6,
      votesCount: '150K+',
      category: 'bollywood',
      formats: ['2D', '4DX', 'Dolby Atmos'],
      releaseDate: new Date('2024-08-15'),
      posterUrl: '/posters/stree-2.jpg',
      director: 'Amar Kaushik',
      cast: ['Shraddha Kapoor', 'Rajkummar Rao', 'Pankaj Tripathi', 'Abhishek Banerjee'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 4200,
    },
    {
      title: 'Kalki 2898 AD',
      description:
        'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth in the post-apocalyptic city of Kasi in the year 2898 AD to protect the world from evil forces.',
      genre: ['Action', 'Sci-Fi', 'Mythology'],
      duration: 181,
      rating: 'UA',
      imdbRating: 7.6,
      votesCount: '230K+',
      category: 'bollywood',
      formats: ['3D', 'IMAX 3D', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2024-06-27'),
      posterUrl: '/posters/kalki-2898-ad.jpg',
      director: 'Nag Ashwin',
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 3100,
    },
    {
      title: 'Jawan',
      description:
        'A high-octane action thriller which outlines the emotional journey of a prison warden who sets out to rectify the wrongs in the society, with the help of a band of women inmates.',
      genre: ['Action', 'Thriller'],
      duration: 169,
      rating: 'UA',
      imdbRating: 7.0,
      votesCount: '210K+',
      category: 'bollywood',
      formats: ['IMAX 2D', '4DX', '2D'],
      releaseDate: new Date('2023-09-07'),
      posterUrl: '/posters/jawan.jpg',
      director: 'Atlee',
      cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 2890,
    },
    {
      title: '12th Fail',
      description:
        'Based on the real-life story of IPS Officer Manoj Kumar Sharma, 12th Fail tells the inspiring tale of a million students who attempt the world\'s toughest competitive exam, the UPSC, with unyielding grit and resilience.',
      genre: ['Biography', 'Drama'],
      duration: 147,
      rating: 'U',
      imdbRating: 8.8,
      votesCount: '190K+',
      category: 'bollywood',
      formats: ['2D'],
      releaseDate: new Date('2023-10-27'),
      posterUrl: '/posters/12th-fail.jpg',
      director: 'Vidhu Vinod Chopra',
      cast: ['Vikrant Massey', 'Medha Shankr', 'Anant V Joshi', 'Geeta Agrawal Sharma'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 1750,
    },
    {
      title: 'Fighter',
      description:
        'An ambitious boy named Shamsher Pathania joins the Indian Air Force and undergoes rigorous training. Soon, he and his top aviator team face an impending aerial war that tests their courage and brotherhood.',
      genre: ['Action', 'Thriller', 'War'],
      duration: 166,
      rating: 'UA',
      imdbRating: 7.0,
      votesCount: '110K+',
      category: 'bollywood',
      formats: ['3D', 'IMAX 3D', '4DX', '2D'],
      releaseDate: new Date('2024-01-25'),
      posterUrl: '/posters/fighter.jpg',
      director: 'Siddharth Anand',
      cast: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor', 'Karan Singh Grover'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 1420,
    },
    {
      title: 'Dunki',
      description:
        'Four friends from a village in Punjab share a common dream to go to England. The problem is that none of them has the visa or the ticket, until a soldier promises to take them to the land of their dreams via the perilous Donkey Flight route.',
      genre: ['Comedy', 'Drama'],
      duration: 161,
      rating: 'U',
      imdbRating: 6.7,
      votesCount: '135K+',
      category: 'bollywood',
      formats: ['2D'],
      releaseDate: new Date('2023-12-21'),
      posterUrl: '/posters/dunki.jpg',
      director: 'Rajkumar Hirani',
      cast: ['Shah Rukh Khan', 'Taapsee Pannu', 'Vicky Kaushal', 'Boman Irani'],
      language: 'Hindi',
      status: 'now_showing',
      liveViewers: 1100,
    },
  ]);

  // 2. CINEMAS
  const cinemas = await Cinema.insertMany([
    {
      name: 'PVR INOX IMAX Multiplex',
      location: 'Phoenix Palladium, High Street',
      city: 'Mumbai',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1 — IMAX Laser',
          rows: 8,
          seatsPerRow: 14,
          seatTypes: [
            { type: 'standard', price: 14, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 20, rows: [5, 6, 7] },
            { type: 'vip', price: 28, rows: [8] },
          ],
        },
        {
          screenNumber: 2,
          name: 'Screen 2 — Dolby Atmos 4K',
          rows: 6,
          seatsPerRow: 12,
          seatTypes: [
            { type: 'standard', price: 12, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 16, rows: [5, 6] },
          ],
        },
      ],
    },
    {
      name: 'Cinépolis Luxury Cinemas',
      location: 'Nexus Mall, Koramangala',
      city: 'Bengaluru',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1 — VIP Recliners',
          rows: 6,
          seatsPerRow: 10,
          seatTypes: [
            { type: 'premium', price: 18, rows: [1, 2, 3] },
            { type: 'vip', price: 30, rows: [4, 5, 6] },
          ],
        },
        {
          screenNumber: 2,
          name: 'Screen 2 — 4DX Motion',
          rows: 7,
          seatsPerRow: 12,
          seatTypes: [
            { type: 'standard', price: 15, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 22, rows: [5, 6, 7] },
          ],
        },
      ],
    },
    {
      name: 'Miraj Maximum Multiplex',
      location: 'DLF Cyber City, Sector 24',
      city: 'Delhi NCR',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1 — BigPix Dolby Atmos',
          rows: 8,
          seatsPerRow: 14,
          seatTypes: [
            { type: 'standard', price: 12, rows: [1, 2, 3, 4, 5] },
            { type: 'premium', price: 18, rows: [6, 7] },
            { type: 'vip', price: 25, rows: [8] },
          ],
        },
      ],
    },
  ]);

  // 3. SHOWTIMES
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const makeDateTime = (baseDate, hours, minutes) => {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const showtimeList = [];

  // Generate showtimes for all movies across cinemas
  movies.forEach((movie, mIdx) => {
    const cinema = cinemas[mIdx % cinemas.length];
    const screenIdx = mIdx % cinema.screens.length;

    // Today showtime
    showtimeList.push({
      movie: movie._id,
      cinema: cinema._id,
      screenIndex: screenIdx,
      dateTime: makeDateTime(today, 11 + (mIdx % 10), (mIdx * 15) % 60),
      pricing: [
        { seatType: 'standard', price: 12 },
        { seatType: 'premium', price: 18 },
        { seatType: 'vip', price: 25 },
      ],
      bookedSeats: ['A3', 'A4', 'B5', 'B6', 'D1', 'D2'], // Pre-occupied seats
    });

    // Today evening showtime
    showtimeList.push({
      movie: movie._id,
      cinema: cinema._id,
      screenIndex: screenIdx,
      dateTime: makeDateTime(today, 19 + (mIdx % 3), 30),
      pricing: [
        { seatType: 'standard', price: 14 },
        { seatType: 'premium', price: 20 },
        { seatType: 'vip', price: 28 },
      ],
      bookedSeats: ['C3', 'C4', 'C5', 'F1', 'F2', 'F3'],
    });

    // Tomorrow showtime
    showtimeList.push({
      movie: movie._id,
      cinema: cinemas[(mIdx + 1) % cinemas.length]._id,
      screenIndex: 0,
      dateTime: makeDateTime(tomorrow, 14 + (mIdx % 5), 0),
      pricing: [
        { seatType: 'standard', price: 12 },
        { seatType: 'premium', price: 18 },
        { seatType: 'vip', price: 25 },
      ],
      bookedSeats: ['A1', 'A2', 'E4'],
    });

    // Day after showtime
    showtimeList.push({
      movie: movie._id,
      cinema: cinemas[(mIdx + 2) % cinemas.length]._id,
      screenIndex: 0,
      dateTime: makeDateTime(dayAfter, 17, 30),
      pricing: [
        { seatType: 'standard', price: 13 },
        { seatType: 'premium', price: 19 },
        { seatType: 'vip', price: 26 },
      ],
      bookedSeats: ['B1', 'B2'],
    });
  });

  const createdShowtimes = await Showtime.insertMany(showtimeList);

  // 4. SAMPLE INITIAL BOOKINGS
  const booking1 = await Booking.create({
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    customerPhone: '+91 98765 43210',
    showtime: createdShowtimes[0]._id,
    seats: ['A3', 'A4'],
    totalPrice: 24,
    status: 'confirmed',
  });

  const booking2 = await Booking.create({
    customerName: 'Aanya Patel',
    customerEmail: 'aanya.p@example.com',
    customerPhone: '+91 91234 56789',
    showtime: createdShowtimes[1]._id,
    seats: ['C3', 'C4', 'C5'],
    totalPrice: 42,
    status: 'confirmed',
  });

  console.log(`Seeded ${movies.length} real Hollywood & Bollywood movies.`);
  console.log(`Seeded ${cinemas.length} multiplex theaters and ${createdShowtimes.length} showtimes.`);
  console.log(`Seeded initial customer bookings.`);
};

module.exports = seedInitialData;
