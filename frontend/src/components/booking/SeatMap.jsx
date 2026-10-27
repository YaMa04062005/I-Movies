import React from 'react';

const SeatMap = ({
  rows = 5,
  seatsPerRow = 10,
  seatTypes = [],
  pricing = [],
  bookedSeats = [],
  selectedSeats = [],
  onSeatClick,
}) => {
  // Generate row letters A, B, C...
  const getRowLetter = (index) => String.fromCharCode(65 + index);

  // Determine seat tier for a given row index (1-based)
  const getSeatTier = (rowIndex) => {
    if (seatTypes && seatTypes.length > 0) {
      for (const st of seatTypes) {
        if (st.rows && st.rows.includes(rowIndex)) {
          return st.type;
        }
      }
    }
    return 'standard';
  };

  // Determine price for a seat tier from showtime pricing
  const getTierPrice = (tier) => {
    if (pricing && pricing.length > 0) {
      const match = pricing.find((p) => p.seatType === tier);
      if (match) return match.price;
    }
    if (seatTypes && seatTypes.length > 0) {
      const match = seatTypes.find((st) => st.type === tier);
      if (match) return match.price;
    }
    return 10;
  };

  return (
    <div className="seat-map-wrapper">
      {/* Screen Graphic */}
      <div className="screen-container">
        <div className="screen-curve" />
        <span className="screen-label">SCREEN THIS WAY</span>
      </div>

      {/* Seating Grid */}
      <div className="seat-grid-container">
        <div className="seat-grid">
          {Array.from({ length: rows }).map((_, rIdx) => {
            const rowNumber = rIdx + 1; // 1-based
            const rowLetter = getRowLetter(rIdx);
            const tier = getSeatTier(rowNumber);

            return (
              <div key={rowLetter} className="seat-row">
                <span className="row-label">{rowLetter}</span>
                <div className="row-seats">
                  {Array.from({ length: seatsPerRow }).map((_, sIdx) => {
                    const seatNumber = sIdx + 1;
                    const seatId = `${rowLetter}${seatNumber}`;
                    const isBooked = bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    let seatClass = `seat seat-${tier}`;
                    if (isBooked) seatClass += ' seat-booked';
                    else if (isSelected) seatClass += ' seat-selected';

                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={seatClass}
                        disabled={isBooked}
                        onClick={() => !isBooked && onSeatClick(seatId)}
                        title={`${seatId} (${tier.toUpperCase()}) - $${getTierPrice(tier)}`}
                        aria-label={`Seat ${seatId}, ${tier}, $${getTierPrice(tier)}`}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="row-label">{rowLetter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-box seat-standard" />
          <span>Standard (${getTierPrice('standard')})</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-premium" />
          <span>Premium (${getTierPrice('premium')})</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-vip" />
          <span>VIP (${getTierPrice('vip')})</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-selected" />
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-box seat-booked" />
          <span>Sold Out</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
