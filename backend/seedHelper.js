const User = require('./models/User');
const Movie = require('./models/Movie');
const Cinema = require('./models/Cinema');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

const seedInitialData = async () => {
  // Clear all collections
  await User.deleteMany({});
  await Movie.deleteMany({});
  await Cinema.deleteMany({});
  await Showtime.deleteMany({});
  await Booking.deleteMany({});

  // 1. Users
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@imovies.com',
    password: 'admin123',
    role: 'admin',
  });

  const regularUser = await User.create({
    name: 'Regular User',
    email: 'user@imovies.com',
    password: 'user123',
    role: 'user',
  });

  // 2. Movies
  const movies = await Movie.insertMany([
    {
      title: 'The Dark Knight',
      description:
        'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      genre: ['Action', 'Crime', 'Drama'],
      duration: 152,
      rating: 'PG-13',
      releaseDate: new Date('2008-07-18'),
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80',
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      language: 'English',
      status: 'now_showing',
    },
    {
      title: 'Inception',
      description:
        'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      duration: 148,
      rating: 'PG-13',
      releaseDate: new Date('2010-07-16'),
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
      language: 'English',
      status: 'now_showing',
    },
    {
      title: 'Parasite',
      description:
        'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      genre: ['Comedy', 'Drama', 'Thriller'],
      duration: 132,
      rating: 'R',
      releaseDate: new Date('2019-05-30'),
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
      director: 'Bong Joon-ho',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      language: 'Korean',
      status: 'now_showing',
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      description:
        'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
      genre: ['Animation', 'Action', 'Adventure'],
      duration: 140,
      rating: 'PG',
      releaseDate: new Date('2023-06-02'),
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80',
      director: 'Joaquim Dos Santos',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
      language: 'English',
      status: 'now_showing',
    },
    {
      title: 'Dune: Part Two',
      description:
        'Paul Atreides unites with the Fremen to seek revenge against the conspirators who destroyed his family while facing a choice between the love of his life and the fate of the known universe.',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      duration: 166,
      rating: 'PG-13',
      releaseDate: new Date('2024-03-01'),
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Austin Butler'],
      language: 'English',
      status: 'coming_soon',
    },
    {
      title: 'The Shawshank Redemption',
      description:
        'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
      genre: ['Drama'],
      duration: 142,
      rating: 'R',
      releaseDate: new Date('1994-09-23'),
      posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80',
      director: 'Frank Darabont',
      cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
      language: 'English',
      status: 'ended',
    },
  ]);

  // 3. Cinemas
  const cinemas = await Cinema.insertMany([
    {
      name: 'IMovies Cineplex Downtown',
      location: '123 Main Street',
      city: 'New York',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1 - IMAX',
          rows: 6,
          seatsPerRow: 10,
          seatTypes: [
            { type: 'standard', price: 12, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 18, rows: [5] },
            { type: 'vip', price: 25, rows: [6] },
          ],
        },
        {
          screenNumber: 2,
          name: 'Screen 2 - Standard',
          rows: 5,
          seatsPerRow: 8,
          seatTypes: [
            { type: 'standard', price: 10, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 15, rows: [5] },
          ],
        },
      ],
    },
    {
      name: 'IMovies Multiplex West',
      location: '456 West Boulevard',
      city: 'Los Angeles',
      screens: [
        {
          screenNumber: 1,
          name: 'Screen 1 - Dolby Atmos',
          rows: 6,
          seatsPerRow: 12,
          seatTypes: [
            { type: 'standard', price: 14, rows: [1, 2, 3, 4] },
            { type: 'premium', price: 20, rows: [5] },
            { type: 'vip', price: 28, rows: [6] },
          ],
        },
      ],
    },
  ]);

  // 4. Showtimes
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

  const showtimes = await Promise.all([
    Showtime.create({
      movie: movies[0]._id, // Dark Knight
      cinema: cinemas[0]._id,
      screenIndex: 0,
      dateTime: makeDateTime(today, 14, 0),
      pricing: [
        { seatType: 'standard', price: 12 },
        { seatType: 'premium', price: 18 },
        { seatType: 'vip', price: 25 },
      ],
    }),
    Showtime.create({
      movie: movies[0]._id, // Dark Knight
      cinema: cinemas[0]._id,
      screenIndex: 0,
      dateTime: makeDateTime(today, 19, 30),
      pricing: [
        { seatType: 'standard', price: 14 },
        { seatType: 'premium', price: 20 },
        { seatType: 'vip', price: 28 },
      ],
    }),
    Showtime.create({
      movie: movies[1]._id, // Inception
      cinema: cinemas[0]._id,
      screenIndex: 1,
      dateTime: makeDateTime(today, 16, 0),
      pricing: [
        { seatType: 'standard', price: 10 },
        { seatType: 'premium', price: 15 },
      ],
    }),
    Showtime.create({
      movie: movies[2]._id, // Parasite
      cinema: cinemas[0]._id,
      screenIndex: 0,
      dateTime: makeDateTime(tomorrow, 20, 0),
      pricing: [
        { seatType: 'standard', price: 12 },
        { seatType: 'premium', price: 18 },
        { seatType: 'vip', price: 25 },
      ],
    }),
    Showtime.create({
      movie: movies[3]._id, // Spider-Man
      cinema: cinemas[1]._id,
      screenIndex: 0,
      dateTime: makeDateTime(today, 15, 0),
      pricing: [
        { seatType: 'standard', price: 14 },
        { seatType: 'premium', price: 20 },
        { seatType: 'vip', price: 28 },
      ],
    }),
    Showtime.create({
      movie: movies[1]._id, // Inception
      cinema: cinemas[1]._id,
      screenIndex: 0,
      dateTime: makeDateTime(dayAfter, 18, 0),
      pricing: [
        { seatType: 'standard', price: 14 },
        { seatType: 'premium', price: 20 },
        { seatType: 'vip', price: 28 },
      ],
    }),
  ]);

  // 5. Sample Bookings
  const seats1 = ['A1', 'A2', 'A3'];
  await Showtime.findByIdAndUpdate(showtimes[0]._id, {
    $addToSet: { bookedSeats: { $each: seats1 } },
  });
  await Booking.create({
    user: regularUser._id,
    showtime: showtimes[0]._id,
    seats: seats1,
    totalPrice: 36,
  });

  const seats2 = ['E1', 'E2'];
  await Showtime.findByIdAndUpdate(showtimes[0]._id, {
    $addToSet: { bookedSeats: { $each: seats2 } },
  });
  await Booking.create({
    user: regularUser._id,
    showtime: showtimes[0]._id,
    seats: seats2,
    totalPrice: 36,
  });

  console.log('Seeded database with users, movies, cinemas, showtimes, and bookings.');
};

module.exports = seedInitialData;

