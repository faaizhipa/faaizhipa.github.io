new TypeIt("#message", {
    speed: 50,
  })
    .type("Helo!")
    .pause(500)
    .move(-2)
    .type("l")
    .pause(100)
    .move(2)
    .delete(6)
    .type("Sorry guys,")
    .pause(500)
    .delete(11)
    .type("no..err..faces yet")
    .pause(500)
    .delete(18)
    .type("tapi ada canco berputar 😂")
    .pause(500)
    .delete(25)
    .type("happy new year though :)")
    .go();