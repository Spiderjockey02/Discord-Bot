import type { Request, Response } from 'express';

export type ExtendedRequest = Request & {
  _startTime: number
  _endTime: number
}

export type ExtendedResponse = Response & {
  _startTime: number
  _endTime: number
}