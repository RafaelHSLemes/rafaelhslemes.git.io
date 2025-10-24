package com.motivadev.devquotes.controller;

import com.motivadev.devquotes.model.Quote;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping(path = "/quote", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "*")
public class QuoteController {

    private final List<Quote> quotes = List.of(
            new Quote("O código é como humor. Quando você precisa explicá-lo, é ruim.", "Cory House"),
            new Quote("Programadores e artistas são os únicos profissionais que têm como hobby o próprio trabalho.", "Rasmus Lerdorf"),
            new Quote("Simplicidade é a alma da eficiência.", "Austin Freeman"),
            new Quote("Qualquer tolo pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem.", "Martin Fowler"),
            new Quote("Primeiro, resolva o problema. Depois, escreva o código.", "John Johnson"),
            new Quote("Antes de otimizar, meça.", "Donald Knuth"),
            new Quote("A única maneira de ir rápido, é ir bem.", "Robert C. Martin")
    );

    @GetMapping("/random")
    public Quote random() {
        int idx = ThreadLocalRandom.current().nextInt(quotes.size());
        return quotes.get(idx);
    }
}

