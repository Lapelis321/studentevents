exports.handler = async (event, context) => {
  const mockEvents = [
    {
      id: 1,
      title: "Spring Music Festival",
      date: "2024-04-15T19:00:00Z",
      location: "University Campus",
      price: 25.00,
      currency: "EUR",
      minAge: 18,
      dressCode: "Casual",
      description: "Join us for an amazing night of live music featuring local and international artists.",
      additionalInfo: "Food trucks will be available on-site. Bring your student ID for verification.",
      availableTickets: 150,
      totalTickets: 500,
      is_active: true
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      date: "2024-04-22T14:00:00Z",
      location: "Convention Center",
      price: 15.00,
      currency: "EUR",
      minAge: 16,
      dressCode: "Business Casual",
      description: "Explore the latest in technology and innovation with industry leaders.",
      additionalInfo: "Networking lunch included. Laptops recommended for workshops.",
      availableTickets: 200,
      totalTickets: 300,
      is_active: true
    },
    {
      id: 3,
      title: "Art & Culture Night",
      date: "2024-04-28T18:30:00Z",
      location: "City Art Gallery",
      price: 12.00,
      currency: "EUR",
      minAge: 16,
      dressCode: "Smart Casual",
      description: "An evening celebrating local artists and cultural diversity.",
      additionalInfo: "Wine and cheese reception included. Photography allowed.",
      availableTickets: 80,
      totalTickets: 100,
      is_active: true
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(mockEvents)
  };
};
