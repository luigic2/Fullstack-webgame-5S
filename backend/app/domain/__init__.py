"""Lógica de domínio pura — sem dependência de FastAPI/HTTP.

A fonte de verdade do jogo vive aqui. O gabarito das 100 situações, a
pontuação e o decaimento do 5S Score são calculados exclusivamente neste
pacote e nunca expostos ao cliente.
"""
